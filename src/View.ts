module Lucide {
    export class View {
        private matrix = mat4.create();
        private mvpMatrixSetter: UniformSetter;
        private invMatrixSetter: UniformSetter;

        constructor(protected gl: WebGLRenderingContext, public program: Program, public material: Material) {
            this.program.registerMesh(this.material.mesh);
            this.program.registerTextures(this.material.textures);
            this.mvpMatrixSetter = this.program.createUniformSetter("mvpMatrix");
            this.invMatrixSetter = this.program.createUniformSetter("invMatrix");
        }
        
        public reset() {
            mat4.identity(this.matrix);
        }

        public translate(vector: GLM.IArray) {
            mat4.translate(this.matrix, this.matrix, vector);
        }

        public rotate(radian: number, axis: GLM.IArray) {
            mat4.rotate(this.matrix, this.matrix, radian, axis);
        }
        
        public scale(value: GLM.IArray) {
            mat4.scale(this.matrix, this.matrix, value);
        }

        public render(vp: GLM.IArray) {
            var mvp = mat4.create();
            var inv = mat4.create();
            mat4.multiply(mvp, vp, this.matrix);
            mat4.invert(inv, this.matrix);
            this.mvpMatrixSetter.setMatrix4fv(<Float32Array>mvp);
            this.invMatrixSetter.setMatrix4fv(<Float32Array>inv);
            var mesh = this.material.mesh;
            mesh.index.bind();
            this.gl.drawElements(mesh.type, mesh.index.size, this.gl.UNSIGNED_SHORT, 0);
        }
    }
}