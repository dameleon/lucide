module Lucide {
    export class UniformSetter extends Context {
        constructor(context: WebGLRenderingContext, private location: WebGLUniformLocation) {
            super(context);
        }
        public set1f(x: number): UniformSetter {
            this.context.uniform1f(this.location, x);
            return this;
        }
        public set2f(x: number, y: number): UniformSetter {
            this.context.uniform2f(this.location, x, y);
            return this;
        }
        public set3f(x: number, y: number, z: number): UniformSetter {
            this.context.uniform3f(this.location, x, y, z);
            return this;
        }
        public set4f(x: number, y: number, z: number, w: number): UniformSetter {
            this.context.uniform4f(this.location, x, y, z, w);
            return this;
        }
        public set1i(x: number): UniformSetter {
            this.context.uniform1i(this.location, x);
            return this;
        }
        public set2i(x: number, y: number): UniformSetter {
            this.context.uniform2i(this.location, x, y);
            return this;
        }
        public set3i(x: number, y: number, z: number): UniformSetter {
            this.context.uniform3i(this.location, x, y, z);
            return this;
        }
        public set4i(x: number, y: number, z: number, w: number): UniformSetter {
            this.context.uniform4i(this.location, x, y, z, w);
            return this;
        }
        public set1fv(value: Float32Array): UniformSetter {
            this.context.uniform1fv(this.location, value);
            return this;
        }
        public set2fv(value: Float32Array): UniformSetter {
            this.context.uniform2fv(this.location, value);
            return this;
        }
        public set3fv(value: Float32Array): UniformSetter {
            this.context.uniform3fv(this.location, value);
            return this;
        }
        public set4fv(value: Float32Array): UniformSetter {
            this.context.uniform4fv(this.location, value);
            return this;
        }
        public set1iv(value: Int32Array): UniformSetter {
            this.context.uniform1iv(this.location, value);
            return this;
        }
        public set2iv(value: Int32Array): UniformSetter {
            this.context.uniform2iv(this.location, value);
            return this;
        }
        public set3iv(value: Int32Array): UniformSetter {
            this.context.uniform3iv(this.location, value);
            return this;
        }
        public set4iv(value: Int32Array): UniformSetter {
            this.context.uniform4iv(this.location, value);
            return this;
        }
        public setMatrix2fv(value: Float32Array, transpose: boolean = false): UniformSetter {
            this.context.uniformMatrix2fv(this.location, transpose, value);
            return this;
        }
        public setMatrix3fv(value: Float32Array, transpose: boolean = false): UniformSetter {
            this.context.uniformMatrix3fv(this.location, transpose, value);
            return this;
        }
        public setMatrix4fv(value: Float32Array, transpose: boolean = false): UniformSetter {
            this.context.uniformMatrix4fv(this.location, transpose, value);
            return this;
        }
    }
}