function distance(x1=0, y1=0, x2=0, y2=0) {
    var delta_x = x1 - x2;
    var delta_y = y1 - y2;

    return Math.sqrt(delta_x * delta_x + delta_y * delta_y);
}
