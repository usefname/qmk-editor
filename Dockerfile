FROM rust:1.69.0-bullseye as builder
ENV DEBIAN_FRONTEND=noninteractive
RUN curl -fsSL https://deb.nodesource.com/setup_current.x | bash -
RUN apt update && apt install -y nodejs libdbus-1-dev libgtk-3-dev libsoup2.4-dev libjavascriptcoregtk-4.0-dev libwebkit2gtk-4.0-dev && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /usr/src/qmk-editor
COPY . .
RUN yarn install
RUN yarn run tauri build

FROM scratch
COPY --from=builder /usr/src/qmk-editor/src-tauri/target/release/bundle/deb/qmk-editor_0.1.0_amd64.deb .
