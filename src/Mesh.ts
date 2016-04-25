module Lucide {
    export class Mesh extends Context {
        public position: VertexBufferObject;
        public index: IndexBufferObject;
        public normal: VertexBufferObject;
        public texture: VertexBufferObject;
        public color: VertexBufferObject;
        public usage: number = this.context.STATIC_DRAW;
        public type: number = this.context.TRIANGLES;
        public size: number = 3;

        constructor(
            context: WebGLRenderingContext,
            position: Float32Array,
            index: Int16Array,
            normal?: Float32Array,
            texture?: Float32Array,
            color?: Float32Array
        ) {
            super(context);
            this.initialize(position, index, normal, texture, color);
        }

        protected initialize(
            position: Float32Array,
            index: Int16Array,
            normal?: Float32Array,
            texture?: Float32Array,
            color?: Float32Array
        ) {
            this.position = new VertexBufferObject(this.context, this.size, position, this.usage);
            this.index = new IndexBufferObject(this.context, index, this.usage);
            !normal  || (this.normal  = new VertexBufferObject(this.context, this.size, normal,  this.usage));
            !color   || (this.color   = new VertexBufferObject(this.context, this.size, color,   this.usage));
            !texture || (this.texture = new VertexBufferObject(this.context, 2, texture, this.usage));
        }
    }
}