(function(global, undefined) {
    var document = global.document;
    var img1 = new Image();
    var img2 = new Image();

    function init() {
        var canvas = document.querySelector("#gl");
        var vShaderElm = document.querySelector("#v-shader");
        var fShaderElm = document.querySelector("#f-shader");
        var sp = sphere(32, 32, 1.0);

        var gl = new Lucide.Gl(canvas);

        gl.exec(function(gl) {
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.BLEND);
            gl.depthFunc(gl.LEQUAL);
        });
        var ibo = gl.createIBO(new Int16Array(sp.i));
        var texture0 = gl.createTexture(0);
        var texture1 = gl.createTexture(1);

        texture0.set(img1);
        texture1.set(img2);

        var program = gl.createProgram(
            gl.createVertexShader(vShaderElm.textContent),
            gl.createFragmentShader(fShaderElm.textContent)
        );
        program.createAttributeSetter('position').setValue(3, new Float32Array(sp.p));
        program.createAttributeSetter('color').setValue(3, new Float32Array(sp.c));
        program.createAttributeSetter('normal').setValue(3, new Float32Array(sp.n));
        program.createAttributeSetter('texCoord').setValue(2, new Float32Array(sp.t));
        var matrixSetter = program.createUniformSetter('mvpMatrix');
        var invSetter = program.createUniformSetter('invMatrix');
        program.createUniformSetter('lightDirection').set3fv(new Float32Array([1.0, 1.0, 1.0]));
        program.createUniformSetter('eyePosition').set3fv(new Float32Array([1.0, 1.0, 1.0]));
        program.createUniformSetter('centerPoint').set3fv(new Float32Array([0.0, 0.0, 0.0]));
        program.createUniformSetter('texture0').set1i(texture0.unit);
        program.createUniformSetter('texture1').set1i(texture1.unit);

        var m = new matIV();
        var mMatrix = m.identity(m.create());
        var vMatrix = m.identity(m.create());
        var pMatrix = m.identity(m.create());
        var tmpMatrix = m.identity(m.create());
        var mvpMatrix = m.identity(m.create());
        var invMatrix = m.identity(m.create());

        m.lookAt([0.0, 0.0, 5.0], [0, 0, 0], [0, 1, 0], vMatrix);
        m.perspective(45, canvas.width / canvas.height, 0.1, 100, pMatrix);
        m.multiply(pMatrix, vMatrix, tmpMatrix);

        var count = 0;

        texture0.bind();
        texture1.bind();

        function render() {
            count++;
            gl.clear();
            var rad = (count % 360) * Math.PI / 180;

            m.identity(mMatrix);
            m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
            m.multiply(tmpMatrix, mMatrix, mvpMatrix);
            m.inverse(mMatrix, invMatrix);
            matrixSetter.setMatrix4fv(mvpMatrix);
            invSetter.setMatrix4fv(invMatrix);

            gl.drawElements(gl.context.TRIANGLES, ibo);

            m.identity(mMatrix);
            m.translate(mMatrix, [0.0, 1.0, 0.0], mMatrix);
            m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
            m.multiply(tmpMatrix, mMatrix, mvpMatrix);
            m.inverse(mMatrix, invMatrix);
            matrixSetter.setMatrix4fv(mvpMatrix);
            invSetter.setMatrix4fv(invMatrix);

            gl.drawElements(gl.context.TRIANGLES, ibo);

            gl.flush();

            requestAnimationFrame(render);
        }
        render();
    }

    document.addEventListener("DOMContentLoaded", function() {
        var p1 = new Promise(function(resolve, reject) {
            img1.src = "/texture0.png";
            img1.onload = resolve;
            img1.onerror = reject;
        });
        var p2 = new Promise(function(resolve, reject) {
            img2.src = "/texture1.png";
            img2.onload = resolve;
            img2.onerror = reject;
        });

        Promise.all([p1, p2]).then(function() {
            init();
        });
    });

})(this, void 0);