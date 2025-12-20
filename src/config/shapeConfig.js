import { Rect, Circle, Triangle, Polygon, Path } from 'fabric';

/**
 * Configuration for available shapes.
 * This makes it easier to add new shapes without touching core logic.
 */
export const shapeConfig = {
    rect: (options) => new Rect(options),
    circle: (options) => {
        // Fabric Circle uses radius, but we often receive width
        if (options.width && !options.radius) options.radius = options.width / 2;
        return new Circle(options);
    },
    triangle: (options) => new Triangle(options),
    star: (options) => {
        const points = [
            { x: 350, y: 75 },
            { x: 380, y: 160 },
            { x: 470, y: 160 },
            { x: 400, y: 215 },
            { x: 423, y: 301 },
            { x: 350, y: 250 },
            { x: 277, y: 301 },
            { x: 303, y: 215 },
            { x: 231, y: 161 },
            { x: 321, y: 161 }
        ];
        // Note: objectCaching false is often specific to the app's needs, keeping it here.
        const shape = new Polygon(points, { ...options, objectCaching: false });
        shape.scaleToWidth(options.width || 100);
        return shape;
    },
    pentagon: (options) => {
        const points = [
            { x: 50, y: 0 },
            { x: 100, y: 38 },
            { x: 82, y: 100 },
            { x: 18, y: 100 },
            { x: 0, y: 38 }
        ];
        const shape = new Polygon(points, { ...options, objectCaching: false });
        shape.scaleToWidth(options.width || 100);
        return shape;
    },
    hexagon: (options) => {
        const points = [
            { x: 50, y: 0 },
            { x: 100, y: 25 },
            { x: 100, y: 75 },
            { x: 50, y: 100 },
            { x: 0, y: 75 },
            { x: 0, y: 25 }
        ];
        const shape = new Polygon(points, { ...options, objectCaching: false });
        shape.scaleToWidth(options.width || 100);
        return shape;
    },
    arrow: (options) => {
        const points = [
            { x: 0, y: 25 },
            { x: 50, y: 25 },
            { x: 50, y: 0 },
            { x: 100, y: 50 },
            { x: 50, y: 100 },
            { x: 50, y: 75 },
            { x: 0, y: 75 }
        ];
        const shape = new Polygon(points, { ...options, objectCaching: false });
        shape.scaleToWidth(options.width || 100);
        return shape;
    },
    heart: (options) => {
        const pathData = 'M 272.70141,238.71731 \
        C 206.46141,238.71731 152.70141,292.47731 152.70141,358.71731  \
        C 152.70141,493.46231 288.63461,521.28716 381.92956,598.5043 \
        C 468.52458,519.8324 611.16641,496.06231 611.16641,358.71731 \
        C 611.16641,292.47731 557.40641,238.71731 491.16641,238.71731 \
        C 449.12141,238.71731 411.66641,262.11731 381.92956,298.5043 \
        C 352.19271,262.11731 314.73141,238.71731 272.70141,238.71731  \
        z';
        const shape = new Path(pathData, { ...options, objectCaching: false });
        shape.scaleToWidth(options.width || 100);
        return shape;
    },
    message_box: (options) => {
        const pathData = 'M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z';
        const shape = new Path(pathData, { ...options, objectCaching: false });
        shape.scaleToWidth(options.width || 100);
        return shape;
    }
};

/**
 * Helper to create a shape by type
 */
export const createShape = (type, options) => {
    if (shapeConfig[type]) {
        return shapeConfig[type](options);
    }
    console.warn(`Shape type "${type}" not found in config.`);
    return null;
};
