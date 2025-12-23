import { Rect, Circle, Triangle, Polygon, Path } from 'fabric';

/**
 * Configuration for available shapes.
 * This makes it easier to add new shapes without touching core logic.
 */
export const shapeConfig = {
    rect: (options) => new Rect({ strokeUniform: true, ...options }),
    circle: (options) => {
        // Fabric Circle uses radius, but we often receive width
        if (options.width && !options.radius) options.radius = options.width / 2;
        return new Circle({ strokeUniform: true, ...options });
    },
    triangle: (options) => new Triangle({ strokeUniform: true, ...options }),
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
        const shape = new Polygon(points, { strokeUniform: true, ...options, objectCaching: false });
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
        const shape = new Polygon(points, { strokeUniform: true, ...options, objectCaching: false });
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
        const shape = new Polygon(points, { strokeUniform: true, ...options, objectCaching: false });
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
        const shape = new Polygon(points, { strokeUniform: true, ...options, objectCaching: false });
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
        const shape = new Path(pathData, { strokeUniform: true, ...options, objectCaching: false });
        shape.scaleToWidth(options.width || 100);
        return shape;
    },
    message_box: (options) => {
        const pathData = 'M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z';
        const shape = new Path(pathData, { strokeUniform: true, ...options, objectCaching: false });
        shape.scaleToWidth(options.width || 100);
        return shape;
    },
    right_triangle: (options) => {
        const points = [{ x: 0, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }];
        const shape = new Polygon(points, { strokeUniform: true, ...options, objectCaching: false });
        shape.scaleToWidth(options.width || 100);
        return shape;
    },
    diamond: (options) => {
        const points = [{ x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 }];
        const shape = new Polygon(points, { strokeUniform: true, ...options, objectCaching: false });
        shape.scaleToWidth(options.width || 100);
        return shape;
    },
    parallelogram: (options) => {
        const points = [{ x: 25, y: 0 }, { x: 100, y: 0 }, { x: 75, y: 100 }, { x: 0, y: 100 }];
        const shape = new Polygon(points, { strokeUniform: true, ...options, objectCaching: false });
        shape.scaleToWidth(options.width || 100);
        return shape;
    },
    trapezoid: (options) => {
        const points = [{ x: 25, y: 0 }, { x: 75, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }];
        const shape = new Polygon(points, { strokeUniform: true, ...options, objectCaching: false });
        shape.scaleToWidth(options.width || 100);
        return shape;
    },
    cross: (options) => {
        const points = [
            { x: 35, y: 0 }, { x: 65, y: 0 }, { x: 65, y: 35 }, { x: 100, y: 35 },
            { x: 100, y: 65 }, { x: 65, y: 65 }, { x: 65, y: 100 }, { x: 35, y: 100 },
            { x: 35, y: 65 }, { x: 0, y: 65 }, { x: 0, y: 35 }, { x: 35, y: 35 }
        ];
        const shape = new Polygon(points, { strokeUniform: true, ...options, objectCaching: false });
        shape.scaleToWidth(options.width || 100);
        return shape;
    },
    cloud: (options) => {
        const pathData = 'M 25,60 a 20,20 0 0 1 0,-40 a 25,25 0 0 1 45,0 a 20,20 0 0 1 5,40 z'; // Simple cloud approximation
        // Better Cloud Path
        const path = 'M17.5,19c-4.1,0-7.5-3.4-7.5-7.5c0-1.8,0.6-3.4,1.7-4.7C10.6,2.8,14.5,0,19,0c5.4,0,9.8,3.9,10.8,9.1 c1.4-0.7,3-1.1,4.7-1.1c5.2,0,9.5,4.3,9.5,9.5c0,0.3,0,0.5,0,0.8C46.8,18.8,49,21.6,49,25c0,4.4-3.6,8-8,8H9c-5,0-9-4-9-9 c0-4.7,3.6-8.5,8.2-8.9C8.8,22.2,12.8,19,17.5,19z';
        const shape = new Path(path, { strokeUniform: true, ...options, objectCaching: false });
        shape.scaleToWidth(options.width || 100);
        return shape;
    },
    burst: (options) => {
        const points = [];
        const rays = 12;
        const innerRadius = 30;
        const outerRadius = 50;
        const center = { x: 50, y: 50 };
        for (let i = 0; i < rays * 2; i++) {
            const r = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI * i) / rays;
            points.push({
                x: center.x + r * Math.sin(angle),
                y: center.y + r * Math.cos(angle)
            });
        }
        const shape = new Polygon(points, { strokeUniform: true, ...options, objectCaching: false });
        shape.scaleToWidth(options.width || 100);
        return shape;
    },
    lightning: (options) => {
        const points = [
            { x: 40, y: 0 }, { x: 15, y: 60 }, { x: 45, y: 60 },
            { x: 25, y: 100 }, { x: 75, y: 35 }, { x: 45, y: 35 }
        ];
        const shape = new Polygon(points, { strokeUniform: true, ...options, objectCaching: false });
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
