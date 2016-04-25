module Lucide {
    class BufferObject<T extends ArrayBuffer> extends Context {
        public buffer: WebGLBuffer;
        public target: number;

        constructor(context: WebGLRenderingContext, value: T, public usage: number) {
            super(context);
            this.buffer = this.context.createBuffer();
        }

        protected initialize(value: T) {
            this.bind();
            this.setData(value);
            this.unbind();
        }

        public setData(value: T) {
            this.context.bufferData(this.target, value, this.usage);
        }

        public bind() {
            this.context.bindBuffer(this.target, this.buffer);
        }

        public unbind() {
            this.context.bindBuffer(this.target, null);
        }
    }

    export class VertexBufferObject extends BufferObject<Float32Array> {
        constructor(context: WebGLRenderingContext, public size: number, value: Float32Array, public usage: number = context.STATIC_DRAW) {
            super(context, value, usage);
            this.target = this.context.ARRAY_BUFFER;
            this.initialize(value);
        }
    }

    export class IndexBufferObject extends BufferObject<Int16Array> {
        public size: number;

        constructor(context: WebGLRenderingContext, value: Int16Array, public usage: number = context.STATIC_DRAW) {
            super(context, value, usage);
            this.target = this.context.ELEMENT_ARRAY_BUFFER;
            this.size = value.length;
            this.initialize(value);
        }
    }
}