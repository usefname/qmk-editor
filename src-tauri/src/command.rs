
use std::io::{Read};

use std::os::unix::process::CommandExt;
use std::path::Path;
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;
use std::thread::{JoinHandle, sleep};
use std::time::Duration;
use anyhow::{bail, Context, Result};

use nix::libc::{pid_t};

use nix::sys::signal::{killpg, SIGINT};
use nix::unistd::{Pid};


#[derive(Debug)]
pub struct BuildProcess {
    pub command: String,
    pub thread_id: Option<JoinHandle<bool>>,
    pub stop: Arc<Mutex<bool>>,
    pub output: Arc<Mutex<String>>,
}


#[allow(non_camel_case_types)]
pub enum BuildEvent {
    build_output,
    build_finished
}

impl BuildEvent {
    pub fn as_str(&self) -> &'static str {
        match self {
            BuildEvent::build_output => {"build_output"}
            BuildEvent::build_finished => {"build_finished"}
        }
    }
}

fn read_bytes<T>(stdout: &mut T, bytes: &mut [u8]) -> Option<usize>
    where T: Read
{
    let bytes_read = match stdout.read(bytes) {
        Ok(bytes_read) => bytes_read,
        Err(e) => {
            eprintln!("Failed to read build stdout: {}", e.to_string());
            eprintln!("Aborting build");
            return None;
        }
    };
    if bytes_read == 0 {
        return None;
    }
    Some(bytes_read)
}

fn emit_output<T, F>(io_callback: F, mut stdout: T, output_buffer: Arc<Mutex<String>>)
where
    T: Read,
    F: Fn(BuildEvent, String) -> () + Clone + Send + 'static
{
    let mut bytes = [0u8; 1024];
    loop {
        sleep(Duration::from_millis(100));
        if let Some(bytes_read) = read_bytes(&mut stdout, &mut bytes) {
            let str = String::from_utf8_lossy(&bytes[..bytes_read]);
            io_callback(BuildEvent::build_output, str.to_string());
            let mut buffer = match output_buffer.lock() {
                Ok(buffer) => buffer,
                Err(e) => {
                    eprintln!("Failed to get lock on build output buffer: {}", e);
                    break;
                }
            };
            buffer.push_str(&str);
        } else {
            break;
        }
    }
}



pub fn async_command<P, F>(io_callback: F, path: P, program: &str, arg: &str) -> Result<BuildProcess>
    where
        P: AsRef<Path>,
        F: Fn(BuildEvent, String) -> () + Clone + Send + 'static
{
    let command_str= [program, arg].join(" ");
    let mut child = Command::new(program)
        .arg(arg)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .current_dir(path)
        .process_group(0)
        .spawn().context("Failed to start build")?;

    let stdout = match child.stdout.take() {
        Some(stream) => stream,
        None => {
            child.kill().context("Could not get build output, build process unresponsive")?;
            bail!("Could not get build output");
        }
    };
    let stderr = match child.stderr.take() {
        Some(stream) => stream,
        None => {
            child.kill().context("Could not get build output, build process unresponsive")?;
            bail!("Could not get build output");
        }
    };

    let stop_lock = Arc::new(Mutex::new(false));

    let output_buffer = Arc::new(Mutex::new(String::with_capacity(4096)));
    let stdout_buffer = output_buffer.clone();
    let stderr_buffer = output_buffer.clone();
    let child_stop_lock = stop_lock.clone();
    let stdout_callback = io_callback.clone();
    let stderr_callback = io_callback.clone();
    let child_thread = thread::spawn(move || {
        let stdout_thread = thread::spawn(move || {
            emit_output(stdout_callback, stdout, stdout_buffer);
        });
        thread::spawn(move || {
            emit_output(stderr_callback, stderr, stderr_buffer);
        });

        loop {
            sleep(Duration::from_millis(100));
            if stdout_thread.is_finished() {
                break;
            }

            let stop = child_stop_lock.lock().unwrap();
            if *stop {
                let child_pid = child.id() as pid_t;
                if let Err(e) = killpg(Pid::from_raw(child_pid), SIGINT) {
                    eprintln!("Failed to stop build process: {}", child_pid);
                    eprintln!("{}", e);
                }
                break;
            }
        }

        let success = match child.wait() {
            Ok(exit_status) => exit_status.success(),
            Err(e) => {
                eprintln!("Build failed, {}", e);
                false
            }
        };

        io_callback(BuildEvent::build_finished, success.to_string());
        success
    });

    println!("child: {:?}", child_thread.thread().id());

    let build_process = BuildProcess {
        command: command_str,
        thread_id: Some(child_thread),
        stop: stop_lock.clone(),
        output: output_buffer,
    };

    Ok(build_process)
}
