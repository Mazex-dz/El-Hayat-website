(function() {
    // Minimal OGL-like Engine for standalone use
    class Renderer {
        constructor({ canvas, dpr = 1 }) {
            this.canvas = canvas;
            this.dpr = dpr;
            this.gl = canvas.getContext('webgl', { alpha: true }) || canvas.getContext('experimental-webgl', { alpha: true });
            if (!this.gl) console.error('WebGL not supported');
            this.gl.clearColor(0, 0, 0, 0); // Clear to transparent
        }
        setSize(width, height) {
            this.width = width;
            this.height = height;
            this.canvas.width = width * this.dpr;
            this.canvas.height = height * this.dpr;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
        render({ scene }) {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            scene.draw();
        }
    }

    class Vec2 extends Array {
        constructor(x = 0, y = 0) {
            super(x, y);
        }
        set(x, y) {
            this[0] = x;
            this[1] = y;
            return this;
        }
    }

    class Program {
        constructor(gl, { vertex, fragment, uniforms = {} }) {
            this.gl = gl;
            this.uniforms = uniforms;
            this.program = this.gl.createProgram();
            const vs = this.createShader(gl.VERTEX_SHADER, vertex);
            const fs = this.createShader(gl.FRAGMENT_SHADER, fragment);
            gl.attachShader(this.program, vs);
            gl.attachShader(this.program, fs);
            gl.linkProgram(this.program);
            if (!gl.getProgramParameter(this.program, gl.LINK_PROGRAM_STATUS)) {
                console.error(gl.getProgramInfoLog(this.program));
            }
        }
        createShader(type, source) {
            const shader = this.gl.createShader(type);
            this.gl.shaderSource(shader, source);
            this.gl.compileShader(shader);
            if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                console.error(this.gl.getShaderInfoLog(shader));
            }
            return shader;
        }
        use() {
            this.gl.useProgram(this.program);
            Object.keys(this.uniforms).forEach(name => {
                const u = this.uniforms[name];
                const loc = this.gl.getUniformLocation(this.program, name);
                if (u.value instanceof Vec2) {
                    this.gl.uniform2f(loc, u.value[0], u.value[1]);
                } else {
                    this.gl.uniform1f(loc, u.value);
                }
            });
        }
    }

    class Geometry {
        constructor(gl, attributes = {}) {
            this.gl = gl;
            this.attributes = attributes;
            this.vao = null; // Minimal fallback
        }
        draw(program) {
            Object.keys(this.attributes).forEach(name => {
                const attr = this.attributes[name];
                const loc = this.gl.getAttribLocation(program, name);
                const buffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, attr.data, this.gl.STATIC_DRAW);
                this.gl.enableVertexAttribArray(loc);
                this.gl.vertexAttribPointer(loc, attr.size, this.gl.FLOAT, false, 0, 0);
            });
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
        }
    }

    class Mesh {
        constructor(gl, { geometry, program }) {
            this.gl = gl;
            this.geometry = geometry;
            this.program = program;
        }
        draw() {
            this.program.use();
            this.geometry.draw(this.program.program);
        }
    }

    const vertex = `
        attribute vec2 position;
        void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `;

    const fragment = `
        precision highp float;
        uniform vec2 uResolution;
        uniform float uTime;
        uniform float uHueShift;
        uniform float uNoise;
        uniform float uScan;
        uniform float uScanFreq;
        uniform float uWarp;
        
        vec4 buf[8];
        float rand(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}
        mat3 rgb2yiq=mat3(0.299,0.587,0.114,0.596,-0.274,-0.322,0.211,-0.523,0.312);
        mat3 yiq2rgb=mat3(1.0,0.956,0.621,1.0,-0.272,-0.647,1.0,-1.106,1.703);

        vec3 hueShiftRGB(vec3 col,float deg){
            vec3 yiq=rgb2yiq*col;
            float rad=radians(deg);
            float cosh=cos(rad),sinh=sin(rad);
            vec3 yiqShift=vec3(yiq.x,yiq.y*cosh-yiq.z*sinh,yiq.y*sinh+yiq.z*cosh);
            return clamp(yiq2rgb*yiqShift,0.0,1.0);
        }

        vec4 sigmoid(vec4 x){return 1./(1.+exp(-x));}

        vec4 cppn_fn(vec2 coordinate,float in0,float in1,float in2){
            buf[6]=vec4(coordinate.x,coordinate.y,0.3948+in0,0.36+in1);
            buf[7]=vec4(0.14+in2,sqrt(coordinate.x*coordinate.x+coordinate.y*coordinate.y),0.,0.);
            buf[0]=mat4(vec4(6.54,-3.61,0.75,-1.13),vec4(2.45,3.16,1.22,0.06),vec4(-5.47,-6.15,1.87,-4.77),vec4(6.03,-5.54,-0.90,3.25))*buf[6]+mat4(vec4(0.84,-5.72,3.97,1.65),vec4(-0.24,0.58,-1.76,-5.35),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(0.21,1.12,-1.79,5.02);
            buf[1]=mat4(vec4(-3.35,-6.06,0.55,-4.47),vec4(0.86,1.74,5.64,1.61),vec4(2.49,-3.50,1.71,6.35),vec4(3.31,8.20,1.13,-1.16))*buf[6]+mat4(vec4(5.24,-13.03,0.00,15.87),vec4(2.98,3.12,-0.89,-1.68),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(-5.94,-6.57,-0.88,1.54);
            buf[0]=sigmoid(buf[0]);buf[1]=sigmoid(buf[1]);
            buf[2]=mat4(vec4(-15.21,8.09,-2.42,-1.93),vec4(-5.95,4.31,2.63,1.27),vec4(-7.31,6.72,5.24,5.94),vec4(5.07,8.97,-1.72,-1.15))*buf[6]+mat4(vec4(-11.96,-11.60,6.14,11.23),vec4(2.12,-6.26,-1.70,-0.70),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(-4.17,-3.22,-4.57,-3.64);
            buf[3]=mat4(vec4(3.18,-13.73,1.87,3.23),vec4(0.64,12.76,1.91,0.50),vec4(-0.04,4.48,1.47,1.80),vec4(5.00,13.00,3.39,-4.55))*buf[6]+mat4(vec4(-0.12,7.72,-3.14,4.74),vec4(0.63,3.71,-0.81,-0.39),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(-1.18,-21.62,0.78,1.23);
            buf[2]=sigmoid(buf[2]);buf[3]=sigmoid(buf[3]);
            buf[4]=mat4(vec4(5.21,-7.18,2.72,2.65),vec4(-5.60,-25.35,4.06,0.46),vec4(-10.57,24.28,21.10,37.54),vec4(4.30,-1.96,2.34,-1.37))*buf[0]+mat4(vec4(-17.65,-10.50,2.25,12.46),vec4(6.26,-502.75,-12.64,0.91),vec4(-10.98,20.74,-9.70,-0.76),vec4(5.38,1.48,-4.19,-4.84))*buf[1]+mat4(vec4(12.78,-16.34,-0.39,1.79),vec4(-30.48,-1.83,1.45,-1.11),vec4(19.87,-7.33,-42.94,-98.52),vec4(8.33,-2.73,-2.29,-36.14))*buf[2]+mat4(vec4(-16.29,3.54,-0.44,-9.44),vec4(57.50,-35.60,16.16,-4.15),vec4(-0.07,-3.86,-7.09,3.15),vec4(-12.55,-7.07,1.49,-0.82))*buf[3]+vec4(-7.67,15.92,1.32,-1.66);
            buf[5]=mat4(vec4(-1.41,-0.37,-3.77,-21.36),vec4(-6.21,-9.35,0.92,8.82),vec4(11.46,-22.34,13.62,-18.69),vec4(-0.34,-3.99,-2.46,-0.45))*buf[0]+mat4(vec4(7.34,-4.36,-6.30,-3.86),vec4(1.54,6.54,1.97,-0.58),vec4(6.58,-2.21,3.71,-1.37),vec4(-5.79,10.13,-2.33,-5.96))*buf[1]+mat4(vec4(-2.51,-6.66,-1.40,-0.16),vec4(-0.37,0.53,4.38,-1.30),vec4(-0.70,2.01,-5.16,-3.72),vec4(-13.56,10.48,-0.91,-2.64))*buf[2]+mat4(vec4(-8.64,6.55,-6.39,-5.59),vec4(-0.57,-1.07,36.91,5.73),vec4(14.28,3.71,7.14,-4.59),vec4(2.71,3.60,-4.36,-2.36))*buf[3]+vec4(-5.90,-4.32,1.24,8.59);
            buf[4]=sigmoid(buf[4]);buf[5]=sigmoid(buf[5]);
            buf[6]=mat4(vec4(-1.61,0.79,1.46,0.20),vec4(-28.79,-7.13,1.50,4.65),vec4(-10.94,39.66,0.74,-10.09),vec4(-0.72,-1.54,0.73,2.16))*buf[0]+mat4(vec4(3.25,21.48,-1.01,-3.31),vec4(-3.73,-3.37,-7.22,-0.23),vec4(13.18,0.79,5.33,5.68),vec4(-4.16,-17.79,-6.81,-1.64))*buf[1]+mat4(vec4(0.60,-7.80,-7.21,-2.74),vec4(-3.52,-0.12,-0.52,0.43),vec4(9.67,-22.85,2.06,0.09),vec4(-4.31,-17.73,2.51,5.30))*buf[2]+mat4(vec4(-6.54,-15.79,-6.04,-5.41),vec4(-43.59,28.55,-16.00,18.84),vec4(4.21,8.39,3.09,8.65),vec4(-5.02,-4.45,-4.47,-5.50))*buf[3]+mat4(vec4(1.69,-67.05,6.89,1.90),vec4(1.86,2.39,2.52,4.08),vec4(11.15,1.72,2.07,7.38),vec4(-4.25,-306.24,8.25,-17.13))*buf[4]+mat4(vec4(1.68,-4.58,3.85,-6.34),vec4(1.35,-1.26,9.93,2.90),vec4(-5.27,0.07,-0.13,3.32),vec4(28.34,-4.91,6.10,4.08))*buf[5]+vec4(6.68,12.52,-3.70,-4.10);
            buf[7]=mat4(vec4(-8.26,-4.70,5.09,0.75),vec4(8.65,-17.15,16.51,-8.88),vec4(-4.03,-2.39,-2.60,-1.98),vec4(-2.21,-1.81,-5.97,4.88))*buf[0]+mat4(vec4(6.77,3.50,-2.81,-2.70),vec4(-5.74,-0.27,1.49,-5.05),vec4(13.12,15.73,-2.93,-4.10),vec4(-14.37,-5.03,-6.25,2.98))*buf[1]+mat4(vec4(4.09,-0.94,-5.67,4.75),vec4(4.38,4.83,1.74,-3.43),vec4(2.11,0.16,-104.56,16.94),vec4(-5.22,-2.99,3.83,-1.93))*buf[2]+mat4(vec4(-5.90,1.79,-13.60,-3.80),vec4(6.65,31.91,25.16,91.81),vec4(11.84,4.15,-0.73,6.76),vec4(-6.39,4.03,6.17,-0.32))*buf[3]+mat4(vec4(3.49,-196.91,-8.92,2.81),vec4(3.48,-3.18,5.17,5.18),vec4(-2.40,15.58,1.28,2.02),vec4(-71.25,-62.44,-8.13,0.50))*buf[4]+mat4(vec4(-12.29,-11.17,-7.34,4.39),vec4(10.80,5.63,-0.93,-4.73),vec4(-12.86,-7.03,5.30,7.54),vec4(1.45,8.91,3.51,5.84))*buf[5]+vec4(2.24,-6.70,-0.98,-2.11);
            buf[6]=sigmoid(buf[6]);buf[7]=sigmoid(buf[7]);
            buf[0]=mat4(vec4(1.67,1.38,2.96,0.),vec4(-1.88,-1.48,-3.59,0.),vec4(-1.32,-1.09,-2.31,0.),vec4(0.26,0.23,0.44,0.))*buf[0]+mat4(vec4(-0.62,-0.59,-0.91,0.),vec4(0.17,0.18,0.18,0.),vec4(-2.96,-2.58,-4.90,0.),vec4(1.41,1.18,2.51,0.))*buf[1]+mat4(vec4(-1.25,-1.05,-2.16,0.),vec4(-0.72,-0.52,-1.43,0.),vec4(0.15,0.15,0.27,0.),vec4(0.94,0.88,1.27,0.))*buf[2]+mat4(vec4(-2.42,-1.96,-4.35,0.),vec4(-22.68,-18.05,-41.95,0.),vec4(0.63,0.54,1.10,0.),vec4(-1.54,-1.30,-2.64,0.))*buf[3]+mat4(vec4(-0.49,-0.39,-0.91,0.),vec4(0.95,0.79,1.64,0.),vec4(0.30,0.15,0.86,0.),vec4(1.18,0.94,2.17,0.))*buf[4]+mat4(vec4(0.35,0.32,0.59,0.),vec4(-0.58,-0.48,-1.06,0.),vec4(2.52,1.99,4.68,0.),vec4(0.13,0.08,0.30,0.))*buf[5]+mat4(vec4(-1.77,-1.40,-3.33,0.),vec4(3.16,2.63,5.37,0.),vec4(-3.17,-2.61,-5.54,0.),vec4(-2.85,-2.24,-5.30,0.))*buf[6]+mat4(vec4(1.52,1.22,2.84,0.),vec4(1.52,1.26,2.68,0.),vec4(2.97,2.43,5.23,0.),vec4(2.22,1.88,3.80,0.))*buf[7]+vec4(-1.54,-3.61,0.24,0.);
            buf[0]=sigmoid(buf[0]);
            return vec4(buf[0].x,buf[0].y,buf[0].z,1.);
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / uResolution.xy * 2.0 - 1.0;
            uv.y *= -1.0;
            uv += uWarp * vec2(sin(uv.y * 6.283 + uTime * 0.5), cos(uv.x * 6.283 + uTime * 0.5)) * 0.05;
            vec4 col = cppn_fn(uv, 0.1 * sin(0.3 * uTime), 0.1 * sin(0.69 * uTime), 0.1 * sin(0.44 * uTime));
            
            // Ultra Dark Petrol Palette
            vec3 colorA = vec3(0.0, 0.0, 0.0); // Pure Midnight
            vec3 colorB = vec3(0.0, 0.243, 0.267); // Petrol (#003E44)
            
            vec3 base = mix(colorA, colorB, col.r);
            col.rgb = mix(col.rgb * base * 6.0, base, 0.8); // Higher contrast, darker base
            
            col.rgb = hueShiftRGB(col.rgb, uHueShift);
            float scanline_val = sin(gl_FragCoord.y * uScanFreq) * 0.5 + 0.5;
            col.rgb *= 1.0 - (scanline_val * scanline_val) * uScan;
            col.rgb += (rand(gl_FragCoord.xy + uTime) - 0.5) * uNoise;
            gl_FragColor = vec4(clamp(col.rgb, 0.0, 1.0), 0.7); // 70% opacity for better blending
        }
    `;

    class DarkVeil {
        constructor(container, options = {}) {
            this.container = container;
            this.options = {
                hueShift: 0,
                noiseIntensity: 0,
                scanlineIntensity: 0,
                speed: 0.5,
                scanlineFrequency: 0.5,
                warpAmount: 0.2,
                resolutionScale: 1,
                ...options
            };

            this.canvas = document.createElement('canvas');
            this.canvas.className = 'darkveil-canvas';
            container.appendChild(this.canvas);

            this.renderer = new Renderer({
                dpr: Math.min(window.devicePixelRatio, 2),
                canvas: this.canvas
            });

            this.gl = this.renderer.gl;
            const geomData = new Float32Array([-1, -1, 3, -1, -1, 3]);
            this.geometry = new Geometry(this.gl, {
                position: { size: 2, data: geomData }
            });

            this.program = new Program(this.gl, {
                vertex,
                fragment,
                uniforms: {
                    uTime: { value: 0 },
                    uResolution: { value: new Vec2() },
                    uHueShift: { value: this.options.hueShift },
                    uNoise: { value: this.options.noiseIntensity },
                    uScan: { value: this.options.scanlineIntensity },
                    uScanFreq: { value: this.options.scanlineFrequency },
                    uWarp: { value: this.options.warpAmount }
                }
            });

            this.mesh = new Mesh(this.gl, { geometry: this.geometry, program: this.program });

            this.resize = this.resize.bind(this);
            window.addEventListener('resize', this.resize);
            this.resize();

            this.start = performance.now();
            this.loop = this.loop.bind(this);
            requestAnimationFrame(this.loop);
        }

        resize() {
            const w = this.container.clientWidth;
            const h = this.container.clientHeight;
            this.renderer.setSize(w, h);
            this.program.uniforms.uResolution.value.set(w * this.renderer.dpr, h * this.renderer.dpr);
        }

        loop() {
            this.program.uniforms.uTime.value = ((performance.now() - this.start) / 1000) * this.options.speed;
            this.renderer.render({ scene: this.mesh });
            requestAnimationFrame(this.loop);
        }
    }

    // Expose to window
    window.DarkVeil = DarkVeil;
})();
