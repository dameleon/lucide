module Lucide {
    export class GL extends Context {
        public clearColor = [0.0, 0.0, 0.0, 0.0];
        public clearDepth = 1.0;
        public clearFlag = (this.context.COLOR_BUFFER_BIT|this.context.DEPTH_BUFFER_BIT);
        public Factory: Lucide.Factory;

        constructor(canvas: HTMLCanvasElement) {
            super(canvas.getContext("experimental-webgl"));
            this.Factory = new Factory(this.context);
        }

        public clear() {
            this.context.clearColor.apply(this.context, this.clearColor);
            this.context.clearDepth(this.clearDepth);
            this.context.clear(this.clearFlag);
        }

        public flush() {
            this.context.flush();
        }

        public drawArrays(mode: number, vbo: VertexBufferObject, first: number = 0) {
            vbo.bind();
            this.context.drawArrays(mode, first, vbo.size);
        }

        public drawElements(mode: number, ibo: IndexBufferObject, type: number = this.context.UNSIGNED_SHORT, offset: number = 0) {
            ibo.bind();
            this.context.drawElements(mode, ibo.size, type, offset);
        }

        public exec(target: ((gl: WebGLRenderingContext) => void)) {
            target(this.context);
        }
    }
}