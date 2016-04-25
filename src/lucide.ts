/// <reference path="tsd.d.ts" />

module Lucide {

    export class Gl {
        public context: WebGLRenderingContext;
        public clearColor = [0.0, 0.0, 0.0, 0.0];
        public clearDepth = 1.0;

        constructor(canvas: HTMLCanvasElement) {
            this.context = canvas.getContext("experimental-webgl");
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
        
        public createTexture(unit: number = 0): Texture {
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

    class Renderer {
        constructor(protected gl: WebGLRenderingContext) {

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
        constructor(protected gl: WebGLRenderingContext, public size: number, value: Float32Array, public usage: number = gl.STATIC_DRAW) {
            super(gl, value, usage);
            this.target = this.gl.ARRAY_BUFFER;
            this.initialize(value);
        }
    }

    export class IndexBufferObject extends BufferObject<Int16Array> {
        public size: number;

        constructor(protected gl: WebGLRenderingContext, value: Int16Array, public usage: number = gl.STATIC_DRAW) {
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
        public attributeMap = {
            "position": "position",
            "color": "color",
            "normal": "normal",
            "texture": "texCoord",
        };

        constructor(private gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
            this.context = this.gl.createProgram();
            this.linkShaders(vertexShader, fragmentShader);
        }

        public registerMesh(mesh: Mesh) {
            Object.keys(this.attributeMap).forEach((key) => {
                this.createAttributeSetter(this.attributeMap[key]).setValue(mesh.size, mesh[key], mesh.usage);
            });
        }

        public registerTextures(textures: Texture[]) {
            textures.forEach((tex) => {
                this.createUniformSetter("texture" + tex.unit).set1i(tex.unit);
            });
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

        public setValue(size: number, value: Float32Array, usage?: number): AttributeSetter {
            return this.set(new VertexBufferObject(this.gl, size, value, usage));
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
        public index: number;

        constructor(private gl: WebGLRenderingContext, public unit: number) {
            this.context = this.gl.createTexture();
            this.index = this.gl.TEXTURE0 + unit;
        }

        public set(image: HTMLImageElement, createsMitmap: boolean, level: number, internalFormat: number, format: number, type: number);
        public set(canvas: HTMLCanvasElement, createsMitmap: boolean, level: number, internalFormat: number, format: number, type: number);
        public set(content: any, createsMitmap: boolean = true, level: number = 0, internalFormat: number = this.gl.RGBA, format: number = this.gl.RGBA, type: number = this.gl.UNSIGNED_BYTE) {
            this.bind();
            this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, format, type, content);
            if (createsMitmap) {
                this.gl.generateMipmap(this.gl.TEXTURE_2D);
            }
            this.unbind();
        }

        public bind() {
            this.gl.activeTexture(this.index);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.context);
        }

        public unbind() {
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }
    }

    export class Material {
        public textures: Texture[];

        constructor(public mesh: Mesh, ...textures: Texture[]) {
            this.textures = textures;
        }
    }

    export class Mesh {
        public position: VertexBufferObject;
        public index: IndexBufferObject;
        public normal: VertexBufferObject;
        public texture: VertexBufferObject;
        public color: VertexBufferObject;
        public size: number = 1;
        public usage: number = this.gl.STATIC_DRAW;
        public type: number = this.gl.TRIANGLES;

        constructor(
            protected gl: WebGLRenderingContext,
            position: Float32Array,
            index: Int16Array,
            normal?: Float32Array,
            texture?: Float32Array,
            color?: Float32Array
        ) {
        }

        protected initialize(
            position: Float32Array,
            index: Int16Array,
            normal?: Float32Array,
            texture?: Float32Array,
            color?: Float32Array
        ) {
            this.position = new VertexBufferObject(this.gl, this.size, position, this.usage);
            this.index = new IndexBufferObject(this.gl, index, this.usage);
            normal  || (this.normal  = new VertexBufferObject(this.gl, this.size, normal,  this.usage));
            texture || (this.texture = new VertexBufferObject(this.gl, this.size, texture, this.usage));
            color   || (this.color   = new VertexBufferObject(this.gl, this.size, color,   this.usage));
        }
    }

    export class TriangleMesh extends Mesh {
        public type: number = this.gl.TRIANGLES;
        public size: number = 3;

        constructor(
            protected gl: WebGLRenderingContext,
            position: Float32Array,
            index: Int16Array,
            normal?: Float32Array,
            texture?: Float32Array,
            color?: Float32Array
        ) {
            super(gl, position, index, normal, texture, color);
            this.initialize(position, index, normal, texture, color);
        }
    }

    export class ObjectM {
        private matrix = mat4.create();
        private mvpMatrixSetter: UniformSetter;
        private invMatrixSetter: UniformSetter;

        constructor(protected gl: WebGLRenderingContext, public program: Program, public material: Material) {
            this.program.registerMesh(this.material.mesh);
            this.program.registerTextures(this.material.textures)
            this.mvpMatrixSetter = this.program.createUniformSetter("mvpMatrix");
            this.invMatrixSetter = this.program.createUniformSetter("invMatrix");
        }

        public translate(vector: GLM.IArray) {
            mat4.translate(this.matrix, this.matrix, vector);
        }

        public rotate(radian: number, axis: GLM.IArray) {
            mat4.rotate(this.matrix, this.matrix, radian, axis);
        }

        public render(vp: GLM.IArray) {
            var mvp = mat4.create();
            var inv = mat4.create();
            mat4.multiply(mvp, this.matrix, vp);
            mat4.invert(inv, this.matrix);
            this.mvpMatrixSetter.setMatrix4fv(<Float32Array>mvp);
            this.invMatrixSetter.setMatrix4fv(<Float32Array>inv);
            var mesh = this.material.mesh;
            mesh.index.bind();
            this.gl.drawElements(mesh.type, mesh.index.size, this.gl.UNSIGNED_SHORT, 0);
        }
    }

    export class Point {
        private point = [0.0, 0.0, 0.0];

        constructor(x?: number, y?: number, z?: number) {
            if (arguments.length == 3) {
                this.point = [x, y, z];
            }
        }

        public toArray(): number[] {
            return this.point;
        }
        public get x(): number {
            return this.point[0];
        }
        public get y(): number {
            return this.point[1];
        }
        public get z(): number {
            return this.point[2];
        }
    }
}