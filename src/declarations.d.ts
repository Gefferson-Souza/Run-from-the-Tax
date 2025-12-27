declare module "*.png" {
    const value: number;
    export = value;
}

declare module "*.jpg" {
    const value: number;
    export = value;
}

declare module "*.jpeg" {
    const value: number;
    export = value;
}

declare module "*.glb" {
    const value: number;
    export = value;
}

// React Native's global require - returns ID (number) for assets
declare var require: (id: string) => number;
