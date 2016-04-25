/// <reference path="tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Lucide;
(function (Lucide) {
    var Gl = (function () {
        function Gl(canvas) {
            this.clearColor = [0.0, 0.0, 0.0, 0.0];
            this.clearDepth = 1.0;
            this.context = canvas.getContext("experimental-webgl");
        }
        Gl.prototype.createProgram = function (vertexShader, fragmentShader) {
            return new Program(this.context, vertexShader, fragmentShader);
        };
        Gl.prototype.createVertexShader = function (content) {
            return this.createShader(this.context.VERTEX_SHADER, content);
        };
        Gl.prototype.createFragmentShader = function (content) {
            return this.createShader(this.context.FRAGMENT_SHADER, content);
        };
        Gl.prototype.createShader = function (type, content) {
            var shader = this.context.createShader(type);
            this.context.shaderSource(shader, content);
            this.context.compileShader(shader);
            if (!this.context.getShaderParameter(shader, this.context.COMPILE_STATUS)) {
                throw new Error(this.context.getShaderInfoLog(shader));
            }
            return shader;
        };
        Gl.prototype.createVBO = function (size, value, usage) {
            if (usage === void 0) { usage = this.context.STATIC_DRAW; }
            return new VertexBufferObject(this.context, size, value, usage);
        };
        Gl.prototype.createIBO = function (value, usage) {
            if (usage === void 0) { usage = this.context.STATIC_DRAW; }
            return new IndexBufferObject(this.context, value, usage);
        };
        Gl.prototype.createTexture = function (unit) {
            if (unit === void 0) { unit = 0; }
            return new Texture(this.context, unit);
        };
        Gl.prototype.clear = function () {
            this.context.clearColor.apply(this.context, this.clearColor);
            this.context.clearDepth(this.clearDepth);
            this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
        };
        Gl.prototype.flush = function () {
            this.context.flush();
        };
        Gl.prototype.drawArrays = function (mode, vbo, first) {
            if (first === void 0) { first = 0; }
            vbo.bind();
            this.context.drawArrays(mode, first, vbo.size);
        };
        Gl.prototype.drawElements = function (mode, ibo, type, offset) {
            if (type === void 0) { type = this.context.UNSIGNED_SHORT; }
            if (offset === void 0) { offset = 0; }
            ibo.bind();
            this.context.drawElements(mode, ibo.size, type, offset);
        };
        Gl.prototype.exec = function (target) {
            target(this.context);
        };
        return Gl;
    }());
    Lucide.Gl = Gl;
    var Renderer = (function () {
        function Renderer(gl) {
            this.gl = gl;
        }
        return Renderer;
    }());
    var BufferObject = (function () {
        function BufferObject(gl, value, usage) {
            this.gl = gl;
            this.usage = usage;
            this.buffer = this.gl.createBuffer();
        }
        BufferObject.prototype.initialize = function (value) {
            this.bind();
            this.setData(value);
            this.unbind();
        };
        BufferObject.prototype.setData = function (value) {
            this.gl.bufferData(this.target, value, this.usage);
        };
        BufferObject.prototype.bind = function () {
            this.gl.bindBuffer(this.target, this.buffer);
        };
        BufferObject.prototype.unbind = function () {
            this.gl.bindBuffer(this.target, null);
        };
        return BufferObject;
    }());
    var VertexBufferObject = (function (_super) {
        __extends(VertexBufferObject, _super);
        function VertexBufferObject(gl, size, value, usage) {
            if (usage === void 0) { usage = gl.STATIC_DRAW; }
            _super.call(this, gl, value, usage);
            this.gl = gl;
            this.size = size;
            this.usage = usage;
            this.target = this.gl.ARRAY_BUFFER;
            this.initialize(value);
        }
        return VertexBufferObject;
    }(BufferObject));
    Lucide.VertexBufferObject = VertexBufferObject;
    var IndexBufferObject = (function (_super) {
        __extends(IndexBufferObject, _super);
        function IndexBufferObject(gl, value, usage) {
            if (usage === void 0) { usage = gl.STATIC_DRAW; }
            _super.call(this, gl, value, usage);
            this.gl = gl;
            this.usage = usage;
            this.target = this.gl.ELEMENT_ARRAY_BUFFER;
            this.size = value.length;
            this.initialize(value);
        }
        return IndexBufferObject;
    }(BufferObject));
    Lucide.IndexBufferObject = IndexBufferObject;
    var Program = (function () {
        function Program(gl, vertexShader, fragmentShader) {
            this.gl = gl;
            this.attributeMap = {
                "position": "position",
                "color": "color",
                "normal": "normal",
                "texture": "texCoord",
            };
            this.context = this.gl.createProgram();
            this.linkShaders(vertexShader, fragmentShader);
        }
        Program.prototype.registerMesh = function (mesh) {
            var _this = this;
            Object.keys(this.attributeMap).forEach(function (key) {
                _this.createAttributeSetter(_this.attributeMap[key]).setValue(mesh.size, mesh[key], mesh.usage);
            });
        };
        Program.prototype.registerTextures = function (textures) {
            var _this = this;
            textures.forEach(function (tex) {
                _this.createUniformSetter("texture" + tex.unit).set1i(tex.unit);
            });
        };
        Program.prototype.createAttributeSetter = function (name) {
            return new AttributeSetter(this.gl, this.gl.getAttribLocation(this.context, name));
        };
        Program.prototype.createUniformSetter = function (name) {
            return new UniformSetter(this.gl, this.gl.getUniformLocation(this.context, name));
        };
        Program.prototype.linkShaders = function (vertexShader, fragmentShader) {
            this.vertexShader = vertexShader;
            this.fragmentShader = fragmentShader;
            this.gl.attachShader(this.context, this.vertexShader);
            this.gl.attachShader(this.context, this.fragmentShader);
            this.gl.linkProgram(this.context);
            if (!this.gl.getProgramParameter(this.context, this.gl.LINK_STATUS)) {
                throw new Error(this.gl.getProgramInfoLog(this.context));
            }
            this.gl.useProgram(this.context);
        };
        return Program;
    }());
    Lucide.Program = Program;
    var AttributeSetter = (function () {
        function AttributeSetter(gl, location) {
            this.gl = gl;
            this.location = location;
            this.gl.enableVertexAttribArray(this.location);
        }
        AttributeSetter.prototype.setValue = function (size, value, usage) {
            return this.set(new VertexBufferObject(this.gl, size, value, usage));
        };
        AttributeSetter.prototype.set = function (vbo) {
            vbo.bind();
            this.gl.vertexAttribPointer(this.location, vbo.size, this.gl.FLOAT, false, 0, 0);
            return this;
        };
        return AttributeSetter;
    }());
    Lucide.AttributeSetter = AttributeSetter;
    var UniformSetter = (function () {
        function UniformSetter(gl, location) {
            this.gl = gl;
            this.location = location;
        }
        UniformSetter.prototype.set1f = function (x) {
            this.gl.uniform1f(this.location, x);
            return this;
        };
        UniformSetter.prototype.set2f = function (x, y) {
            this.gl.uniform2f(this.location, x, y);
            return this;
        };
        UniformSetter.prototype.set3f = function (x, y, z) {
            this.gl.uniform3f(this.location, x, y, z);
            return this;
        };
        UniformSetter.prototype.set4f = function (x, y, z, w) {
            this.gl.uniform4f(this.location, x, y, z, w);
            return this;
        };
        UniformSetter.prototype.set1i = function (x) {
            this.gl.uniform1i(this.location, x);
            return this;
        };
        UniformSetter.prototype.set2i = function (x, y) {
            this.gl.uniform2i(this.location, x, y);
            return this;
        };
        UniformSetter.prototype.set3i = function (x, y, z) {
            this.gl.uniform3i(this.location, x, y, z);
            return this;
        };
        UniformSetter.prototype.set4i = function (x, y, z, w) {
            this.gl.uniform4i(this.location, x, y, z, w);
            return this;
        };
        UniformSetter.prototype.set1fv = function (value) {
            this.gl.uniform1fv(this.location, value);
            return this;
        };
        UniformSetter.prototype.set2fv = function (value) {
            this.gl.uniform2fv(this.location, value);
            return this;
        };
        UniformSetter.prototype.set3fv = function (value) {
            this.gl.uniform3fv(this.location, value);
            return this;
        };
        UniformSetter.prototype.set4fv = function (value) {
            this.gl.uniform4fv(this.location, value);
            return this;
        };
        UniformSetter.prototype.set1iv = function (value) {
            this.gl.uniform1iv(this.location, value);
            return this;
        };
        UniformSetter.prototype.set2iv = function (value) {
            this.gl.uniform2iv(this.location, value);
            return this;
        };
        UniformSetter.prototype.set3iv = function (value) {
            this.gl.uniform3iv(this.location, value);
            return this;
        };
        UniformSetter.prototype.set4iv = function (value) {
            this.gl.uniform4iv(this.location, value);
            return this;
        };
        UniformSetter.prototype.setMatrix2fv = function (value, transpose) {
            if (transpose === void 0) { transpose = false; }
            this.gl.uniformMatrix2fv(this.location, transpose, value);
            return this;
        };
        UniformSetter.prototype.setMatrix3fv = function (value, transpose) {
            if (transpose === void 0) { transpose = false; }
            this.gl.uniformMatrix3fv(this.location, transpose, value);
            return this;
        };
        UniformSetter.prototype.setMatrix4fv = function (value, transpose) {
            if (transpose === void 0) { transpose = false; }
            this.gl.uniformMatrix4fv(this.location, transpose, value);
            return this;
        };
        return UniformSetter;
    }());
    Lucide.UniformSetter = UniformSetter;
    var Texture = (function () {
        function Texture(gl, unit) {
            this.gl = gl;
            this.unit = unit;
            this.context = this.gl.createTexture();
            this.index = this.gl.TEXTURE0 + unit;
        }
        Texture.prototype.set = function (content, createsMitmap, level, internalFormat, format, type) {
            if (createsMitmap === void 0) { createsMitmap = true; }
            if (level === void 0) { level = 0; }
            if (internalFormat === void 0) { internalFormat = this.gl.RGBA; }
            if (format === void 0) { format = this.gl.RGBA; }
            if (type === void 0) { type = this.gl.UNSIGNED_BYTE; }
            this.bind();
            this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, format, type, content);
            if (createsMitmap) {
                this.gl.generateMipmap(this.gl.TEXTURE_2D);
            }
            this.unbind();
        };
        Texture.prototype.bind = function () {
            this.gl.activeTexture(this.index);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.context);
        };
        Texture.prototype.unbind = function () {
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        };
        return Texture;
    }());
    Lucide.Texture = Texture;
    var Material = (function () {
        function Material(mesh) {
            var textures = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                textures[_i - 1] = arguments[_i];
            }
            this.mesh = mesh;
            this.textures = textures;
        }
        return Material;
    }());
    Lucide.Material = Material;
    var Mesh = (function () {
        function Mesh(gl, position, index, normal, texture, color) {
            this.gl = gl;
            this.size = 1;
            this.usage = this.gl.STATIC_DRAW;
            this.type = this.gl.TRIANGLES;
        }
        Mesh.prototype.initialize = function (position, index, normal, texture, color) {
            this.position = new VertexBufferObject(this.gl, this.size, position, this.usage);
            this.index = new IndexBufferObject(this.gl, index, this.usage);
            normal || (this.normal = new VertexBufferObject(this.gl, this.size, normal, this.usage));
            texture || (this.texture = new VertexBufferObject(this.gl, this.size, texture, this.usage));
            color || (this.color = new VertexBufferObject(this.gl, this.size, color, this.usage));
        };
        return Mesh;
    }());
    Lucide.Mesh = Mesh;
    var TriangleMesh = (function (_super) {
        __extends(TriangleMesh, _super);
        function TriangleMesh(gl, position, index, normal, texture, color) {
            _super.call(this, gl, position, index, normal, texture, color);
            this.gl = gl;
            this.type = this.gl.TRIANGLES;
            this.size = 3;
            this.initialize(position, index, normal, texture, color);
        }
        return TriangleMesh;
    }(Mesh));
    Lucide.TriangleMesh = TriangleMesh;
    var ObjectM = (function () {
        function ObjectM(gl, program, material) {
            this.gl = gl;
            this.program = program;
            this.material = material;
            this.matrix = mat4.create();
            this.program.registerMesh(this.material.mesh);
            this.program.registerTextures(this.material.textures);
            this.mvpMatrixSetter = this.program.createUniformSetter("mvpMatrix");
            this.invMatrixSetter = this.program.createUniformSetter("invMatrix");
        }
        ObjectM.prototype.translate = function (vector) {
            mat4.translate(this.matrix, this.matrix, vector);
        };
        ObjectM.prototype.rotate = function (radian, axis) {
            mat4.rotate(this.matrix, this.matrix, radian, axis);
        };
        ObjectM.prototype.render = function (vp) {
            var mvp = mat4.create();
            var inv = mat4.create();
            mat4.multiply(mvp, this.matrix, vp);
            mat4.invert(inv, this.matrix);
            this.mvpMatrixSetter.setMatrix4fv(mvp);
            this.invMatrixSetter.setMatrix4fv(inv);
            var mesh = this.material.mesh;
            mesh.index.bind();
            this.gl.drawElements(mesh.type, mesh.index.size, this.gl.UNSIGNED_SHORT, 0);
        };
        return ObjectM;
    }());
    Lucide.ObjectM = ObjectM;
    var Point = (function () {
        function Point(x, y, z) {
            this.point = [0.0, 0.0, 0.0];
            if (arguments.length == 3) {
                this.point = [x, y, z];
            }
        }
        Point.prototype.toArray = function () {
            return this.point;
        };
        Object.defineProperty(Point.prototype, "x", {
            get: function () {
                return this.point[0];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Point.prototype, "y", {
            get: function () {
                return this.point[1];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Point.prototype, "z", {
            get: function () {
                return this.point[2];
            },
            enumerable: true,
            configurable: true
        });
        return Point;
    }());
    Lucide.Point = Point;
})(Lucide || (Lucide = {}));
//# sourceMappingURL=lucide.js.map