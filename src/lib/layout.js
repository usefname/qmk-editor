export const layout_largest_y = (layout) => {
    let largest_y = 0;
    for (let i = 0; i < layout.length; i++) {
        let y = layout[i].y + (layout[i].h ? layout[i].h : 1);
        if (largest_y < y) {
            largest_y = y;
        }
    }
    return largest_y;
}

export const layout_largest_x = (layout) => {
    let largest_x = 0;
    for (let i = 0; i < layout.length; i++) {
        let x = layout[i].x + (layout[i].w ? layout[i].w : 1);
        if (largest_x < x) {
            largest_x = x;
        }
    }
    return largest_x;
}

export const calcLayoutWidth = (layout, keySpacing) => {
    return layout_largest_x(layout) * keySpacing;
}
