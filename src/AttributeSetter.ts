module Lucide {
    export class AttributeSetter extends Context {
        constructor(context: WebGLRenderingContext, private location: number) {
            super(context);
            this.context.enableVertexAttribArray(this.location);
        }

        public setValue(size: number, value: Float32Array, usage?: number): AttributeSetter {
            return this.set(new VertexBufferObject(this.context, size, value, usage));
        }

        public set(vbo: VertexBufferObject): AttributeSetter {
            vbo.bind();
            this.context.vertexAttribPointer(this.location, vbo.size, this.context.FLOAT, false, 0, 0);
            return this;
        }
    }
}