module Lucide {
    export class Texture extends Context {
        public texture: WebGLTexture;
        public index: number;

        constructor(context: WebGLRenderingContext, public unit: number) {
            super(context);
            this.texture = this.context.createTexture();
            this.index = this.context.TEXTURE0 + unit;
        }

        public set(image: HTMLImageElement, createsMitmap: boolean, level: number, internalFormat: number, format: number, type: number);
        public set(canvas: HTMLCanvasElement, createsMitmap: boolean, level: number, internalFormat: number, format: number, type: number);
        public set(content: any, createsMitmap: boolean = true, level: number = 0, internalFormat: number = this.context.RGBA, format: number = this.context.RGBA, type: number = this.context.UNSIGNED_BYTE) {
            this.bind();
            this.context.texImage2D(this.context.TEXTURE_2D, level, internalFormat, format, type, content);
            if (createsMitmap) {
                this.context.generateMipmap(this.context.TEXTURE_2D);
            }
            this.unbind();
        }

        public bind() {
            this.context.activeTexture(this.index);
            this.context.bindTexture(this.context.TEXTURE_2D, this.texture);
        }

        public unbind() {
            this.context.bindTexture(this.context.TEXTURE_2D, null);
        }
    }
}