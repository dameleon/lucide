module Lucide {
    export class Material extends Context {
        public textures: Texture[];

        constructor(context: WebGLRenderingContext, public mesh: Mesh, ...textures: Texture[]) {
            super(context);
            this.textures = textures;
        }
    }
}