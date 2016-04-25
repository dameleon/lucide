module Lucide {
    export class Material {
        public textures: Texture[];

        constructor(public mesh: Mesh, ...textures: Texture[]) {
            this.textures = textures;
        }
    }
}