module Lucide {

    export class Gl {
        public context: WebGLRenderingContext;
        public clearColor = [0.0, 0.0, 0.0, 0.0];
        public clearDepth = 1.0;

        constructor(canvas: HTMLCanvasElement) {
            this.context = canvas.getContext("experimental-webgl");
            this.context.enable(this.context.DEPTH_TEST);
            this.context.depthFunc(this.context.LEQUAL);
        }

        public createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): Program {
            return new Program(this.context, vertexShader, fragmentShader);
        }
        
        public createVertexShader(content: string): WebGLShader {
            return this.createShader(this.context.VERTEX_SHADER, content);
        }
        
        public createFragmentShader(content: string): WebGLShader {
            return this.createShader(this.context.FRAGMENT_SHADER, content);
        }

        private createShader(type: number, content: string): WebGLShader {
            let shader = this.context.createShader(type);
            this.context.shaderSource(shader, content);
            this.context.compileShader(shader);
            if (!this.context.getShaderParameter(shader, this.context.COMPILE_STATUS)) {
                throw new Error(this.context.getShaderInfoLog(shader));
            }
            return shader;
        }

        public createVBO(size: number, value: Float32Array, usage = this.context.STATIC_DRAW): VertexBufferObject {
            return new VertexBufferObject(this.context, size, value, usage);
        }

        public createIBO(value: Int16Array, usage = this.context.STATIC_DRAW): IndexBufferObject {
            return new IndexBufferObject(this.context, value, usage);
        }
        
        public createTexture(unit: number = this.context.TEXTURE0): Texture {
            return new Texture(this.context, unit);
        }

        public clear() {
            this.context.clearColor.apply(this.context, this.clearColor);
            this.context.clearDepth(this.clearDepth);
            this.context.clear(this.context.COLOR_BUFFER_BIT|this.context.DEPTH_BUFFER_BIT);
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

    class BufferObject<T extends ArrayBuffer> {
        public buffer: WebGLBuffer;
        public stride: number;
        public target: number;

        constructor(protected gl: WebGLRenderingContext, value: T, public usage: number) {
            this.buffer = this.gl.createBuffer();
        }

        protected initialize(value: T) {
            this.bind();
            this.setData(value);
            this.unbind();
        }

        public setData(value: T) {
            this.gl.bufferData(this.target, value, this.usage);
        }

        public bind() {
            this.gl.bindBuffer(this.target, this.buffer);
        }

        public unbind() {
            this.gl.bindBuffer(this.target, null);
        }
    }

    export class VertexBufferObject extends BufferObject<Float32Array> {
        constructor(protected gl: WebGLRenderingContext, public size: number, value: Float32Array, public usage: number) {
            super(gl, value, usage);
            this.target = this.gl.ARRAY_BUFFER;
            this.initialize(value);
        }
    }

    export class IndexBufferObject extends BufferObject<Int16Array> {
        public size: number;

        constructor(protected gl: WebGLRenderingContext, value: Int16Array, public usage: number) {
            super(gl, value, usage);
            this.target = this.gl.ELEMENT_ARRAY_BUFFER;
            this.size = value.length;
            this.initialize(value);
        }
    }

    export class Program {
        public context: WebGLProgram;
        public vertexShader: WebGLShader;
        public fragmentShader: WebGLShader;

        constructor(private gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
            this.context = this.gl.createProgram();
            this.linkShaders(vertexShader, fragmentShader);
        }

        public createAttributeSetter(name: string): AttributeSetter {
            return new AttributeSetter(this.gl, this.gl.getAttribLocation(this.context, name));
        }

        public createUniformSetter(name: string) {
            return new UniformSetter(this.gl, this.gl.getUniformLocation(this.context, name));
        }

        public linkShaders(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
            this.vertexShader = vertexShader;
            this.fragmentShader = fragmentShader;
            this.gl.attachShader(this.context, this.vertexShader);
            this.gl.attachShader(this.context, this.fragmentShader);
            this.gl.linkProgram(this.context);
            if (!this.gl.getProgramParameter(this.context, this.gl.LINK_STATUS)) {
                throw new Error(this.gl.getProgramInfoLog(this.context));
            }
            this.gl.useProgram(this.context);
        }
    }

    export class AttributeSetter {
        constructor(private gl: WebGLRenderingContext, private location: number) {
            this.gl.enableVertexAttribArray(this.location);
        }

        public set(vbo: VertexBufferObject): AttributeSetter {
            vbo.bind();
            this.gl.vertexAttribPointer(this.location, vbo.size, this.gl.FLOAT, false, 0, 0);
            return this;
        }
    }

    export class UniformSetter {
        constructor(private gl: WebGLRenderingContext, private location: WebGLUniformLocation) {
        }
        public set1f(x: number): UniformSetter {
            this.gl.uniform1f(this.location, x);
            return this;
        }
        public set2f(x: number, y: number): UniformSetter {
            this.gl.uniform2f(this.location, x, y);
            return this;
        }
        public set3f(x: number, y: number, z: number): UniformSetter {
            this.gl.uniform3f(this.location, x, y, z);
            return this;
        }
        public set4f(x: number, y: number, z: number, w: number): UniformSetter {
            this.gl.uniform4f(this.location, x, y, z, w);
            return this;
        }
        public set1i(x: number): UniformSetter {
            this.gl.uniform1i(this.location, x);
            return this;
        }
        public set2i(x: number, y: number): UniformSetter {
            this.gl.uniform2i(this.location, x, y);
            return this;
        }
        public set3i(x: number, y: number, z: number): UniformSetter {
            this.gl.uniform3i(this.location, x, y, z);
            return this;
        }
        public set4i(x: number, y: number, z: number, w: number): UniformSetter {
            this.gl.uniform4i(this.location, x, y, z, w);
            return this;
        }
        public set1fv(value: Float32Array): UniformSetter {
            this.gl.uniform1fv(this.location, value);
            return this;
        }
        public set2fv(value: Float32Array): UniformSetter {
            this.gl.uniform2fv(this.location, value);
            return this;
        }
        public set3fv(value: Float32Array): UniformSetter {
            this.gl.uniform3fv(this.location, value);
            return this;
        }
        public set4fv(value: Float32Array): UniformSetter {
            this.gl.uniform4fv(this.location, value);
            return this;
        }
        public set1iv(value: Int16Array): UniformSetter {
            this.gl.uniform1iv(this.location, value);
            return this;
        }
        public set2iv(value: Int16Array): UniformSetter {
            this.gl.uniform2iv(this.location, value);
            return this;
        }
        public set3iv(value: Int16Array): UniformSetter {
            this.gl.uniform3iv(this.location, value);
            return this;
        }
        public set4iv(value: Int16Array): UniformSetter {
            this.gl.uniform4iv(this.location, value);
            return this;
        }
        public setMatrix2fv(value: Float32Array, transpose: boolean = false): UniformSetter {
            this.gl.uniformMatrix2fv(this.location, transpose, value);
            return this;
        }
        public setMatrix3fv(value: Float32Array, transpose: boolean = false): UniformSetter {
            this.gl.uniformMatrix3fv(this.location, transpose, value);
            return this;
        }
        public setMatrix4fv(value: Float32Array, transpose: boolean = false): UniformSetter {
            this.gl.uniformMatrix4fv(this.location, transpose, value);
            return this;
        }
    }

    export class Texture {
        public context: WebGLTexture;

        constructor(private gl: WebGLRenderingContext, public unit: number) {
            this.context = this.gl.createTexture();
        }

        public set(image: HTMLImageElement, createsMitmap: boolean, level: number, internalFormat: number, format: number, type: number);
        public set(canvas: HTMLCanvasElement, createsMitmap: boolean, level: number, internalFormat: number, format: number, type: number);
        public set(content: any, createsMitmap: boolean = true, level: number = 0, internalFormat: number = this.gl.RGBA, format: number = this.gl.RGBA, type: number = this.gl.UNSIGNED_BYTE) {
            this.gl.activeTexture(this.unit);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.context);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, content);
            if (createsMitmap) {
                this.gl.generateMipmap(this.gl.TEXTURE_2D);
            }
            // this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }
    }
}