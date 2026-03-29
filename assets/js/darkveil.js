class DarkVeil {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        // Use more dynamic defaults if no options provided
        this.options = {
            hueShift: options.hueShift || 0,
            noiseIntensity: options.noiseIntensity !== undefined ? options.noiseIntensity : 0.2, // Default noise for texture
            scanlineIntensity: options.scanlineIntensity !== undefined ? options.scanlineIntensity : 0.4,
            speed: options.speed || 0.5,
            scanlineFrequency: options.scanlineFrequency !== undefined ? options.scanlineFrequency : 50,
            warpAmount: options.warpAmount !== undefined ? options.warpAmount : 1.5, // Default warp for movement
            resolutionScale: options.resolutionScale || 1,
            color: options.color || null, // Accept hex color
            ...options
        };

        // Convert hex color to rgb
        this.rgbColor = this.hexToRgb(this.options.color);

        this.vertex = `
            attribute vec2 position;
            void main(){gl_Position=vec4(position,0.0,1.0);}
        `;

        this.fragment = `
            #ifdef GL_ES
            precision lowp float;
            #endif
            uniform vec2 uResolution;
            uniform float uTime;
            uniform float uHueShift;
            uniform float uNoise;
            uniform float uScan;
            uniform float uScanFreq;
            uniform float uWarp;
            uniform vec3 uColor;
            uniform bool uHasColor;

            #define iTime uTime
            #define iResolution uResolution

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
                buf[6]=vec4(coordinate.x,coordinate.y,0.3948333106474662+in0,0.36+in1);
                buf[7]=vec4(0.14+in2,sqrt(coordinate.x*coordinate.x+coordinate.y*coordinate.y),0.,0.);
                buf[0]=mat4(vec4(6.5404263,-3.6126034,0.7590882,-1.13613),vec4(2.4582713,3.1660357,1.2219609,0.06276096),vec4(-5.478085,-6.159632,1.8701609,-4.7742867),vec4(6.039214,-5.542865,-0.90925294,3.251348))*buf[6]+mat4(vec4(0.8473259,-5.722911,3.975766,1.6522468),vec4(-0.24321538,0.5839259,-1.7661959,-5.350116),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(0.21808943,1.1243913,-1.7969975,5.0294676);
                buf[1]=mat4(vec4(-3.3522482,-6.0612736,0.55641043,-4.4719114),vec4(0.8631464,1.7432913,5.643898,1.6106541),vec4(2.4941394,-3.5012043,1.7184316,6.357333),vec4(3.310376,8.209261,1.1355612,-1.165539))*buf[6]+mat4(vec4(5.24046,-13.034365,0.009859298,15.870829),vec4(2.987511,3.129433,-0.89023495,-1.6822904),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(-5.9457836,-6.573602,-0.8812491,1.5436668);
                buf[0]=sigmoid(buf[0]);buf[1]=sigmoid(buf[1]);
                buf[2]=mat4(vec4(-15.219568,8.095543,-2.429353,-1.9381982),vec4(-5.951362,4.3115187,2.6393783,1.274315),vec4(-7.3145227,6.7297835,5.2473326,5.9411426),vec4(5.0796127,8.979051,-1.7278991,-1.158976))*buf[6]+mat4(vec4(-11.967154,-11.608155,6.1486754,11.237008),vec4(2.124141,-6.263192,-1.7050359,-0.7021966),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(-4.17164,-3.2281182,-4.576417,-3.6401186);
                buf[3]=mat4(vec4(3.1832156,-13.738922,1.879223,3.233465),vec4(0.64300746,12.768129,1.9141049,0.50990224),vec4(-0.049295485,4.4807224,1.4733979,1.801449),vec4(5.0039253,13.000481,3.3991797,-4.5561905))*buf[6]+mat4(vec4(-0.1285731,7.720628,-3.1425676,4.742367),vec4(0.6393625,3.714393,-0.8108378,-0.39174938),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(-1.1811101,-21.621881,0.7851888,1.2329718);
                buf[2]=sigmoid(buf[2]);buf[3]=sigmoid(buf[3]);
                buf[4]=mat4(vec4(5.214916,-7.183024,2.7228765,2.6592617),vec4(-5.601878,-25.3591,4.067988,0.4602802),vec4(-10.57759,24.286327,21.102104,37.546658),vec4(4.3024497,-1.9625226,2.3458803,-1.372816))*buf[0]+mat4(vec4(-17.6526,-10.507558,2.2587414,12.462782),vec4(6.265566,-502.75443,-12.642513,0.9112289),vec4(-10.983244,20.741234,-9.701768,-0.7635988),vec4(5.383626,1.4819539,-4.1911616,-4.8444734))*buf[1]+mat4(vec4(12.785233,-16.345072,-0.39901125,1.7955981),vec4(-30.48365,-1.8345358,1.4542528,-1.1118771),vec4(19.872723,-7.337935,-42.941723,-98.52709),vec4(8.337645,-2.7312303,-2.2927687,-36.142323))*buf[2]+mat4(vec4(-16.298317,3.5471997,-0.44300047,-9.444417),vec4(57.5077,-35.609753,16.163465,-4.1534753),vec4(-0.07470326,-3.8656476,-7.0901804,3.1523974),vec4(-12.559385,-7.077619,1.490437,-0.8211543))*buf[3]+vec4(-7.67914,15.927437,1.3207729,-1.6686112);
                buf[5]=mat4(vec4(-1.4109162,-0.372762,-3.770383,-21.367174),vec4(-6.2103205,-9.35908,0.92529047,8.82561),vec4(11.460242,-22.348068,13.625772,-18.693201),vec4(-0.3429052,-3.9905605,-2.4626114,-0.45033523))*buf[0]+mat4(vec4(7.3481627,-4.3661838,-6.3037653,-3.868115),vec4(1.5462853,6.5488915,1.9701879,-0.58291394),vec4(6.5858274,-2.2180402,3.7127688,-1.3730392),vec4(-5.7973905,10.134961,-2.3395722,-5.965605))*buf[1]+mat4(vec4(-2.5132585,-6.6685553,-1.4029363,-0.16285264),vec4(-0.37908727,0.53738135,4.389061,-1.3024765),vec4(-0.70647055,2.0111287,-5.1659346,-3.728635),vec4(-13.562562,10.487719,-0.9173751,-2.6487076))*buf[2]+mat4(vec4(-8.645013,6.5546675,-6.3944063,-5.5933375),vec4(-0.57783127,-1.077275,36.91025,5.736769),vec4(14.283112,3.7146652,7.1452246,-4.5958776),vec4(2.7192075,3.6021907,-4.366337,-2.3653464))*buf[3]+vec4(-5.9000807,-4.329569,1.2427121,8.59503);
                buf[6]=sigmoid(buf[6]);buf[7]=sigmoid(buf[7]);
                buf[0]=mat4(vec4(1.6794263,1.3817469,2.9625452,0.),vec4(-1.8834411,-1.4806935,-3.5924516,0.),vec4(-1.3279216,-1.0918057,-2.3124623,0.),vec4(0.2662234,0.23235129,0.44178495,0.))*buf[0]+mat4(vec4(-0.6299101,-0.5945583,-0.9125601,0.),vec4(0.17828953,0.18300213,0.18182953,0.),vec4(-2.96544,-2.5819945,-4.9001055,0.),vec4(1.4195864,1.1868085,2.5176322,0.))*buf[1]+mat4(vec4(-1.2584374,-1.0552157,-2.1688404,0.),vec4(-0.7200217,-0.52666044,-1.438251,0.),vec4(0.15345335,0.15196142,0.272854,0.),vec4(0.945728,0.8861938,1.2766753,0.))*buf[2]+mat4(vec4(-2.4218085,-1.968602,-4.35166,0.),vec4(-22.683098,-18.0544,-41.954372,0.),vec4(0.63792,0.5470648,1.1078634,0.),vec4(-1.5489894,-1.3075932,-2.6444845,0.))*buf[3]+mat4(vec4(-0.49252132,-0.39877754,-0.91366625,0.),vec4(0.95609266,0.7923952,1.640221,0.),vec4(0.30616966,0.15693925,0.8639857,0.),vec4(1.1825981,0.94504964,2.176963,0.))*buf[4]+mat4(vec4(0.35446745,0.3293795,0.59547555,0.),vec4(-0.58784515,-0.48177817,-1.0614829,0.),vec4(2.5271258,1.9991658,4.6846647,0.),vec4(0.13042648,0.08864098,0.30187556,0.))*buf[5]+mat4(vec4(-1.7718065,-1.4033192,-3.3355875,0.),vec4(3.1664357,2.638297,5.378702,0.),vec4(-3.1724713,-2.6107926,-5.549295,0.),vec4(-2.851368,-2.249092,-5.3013067,0.))*buf[6]+mat4(vec4(1.5203838,1.2212278,2.8404984,0.),vec4(1.5210563,1.2651345,2.683903,0.),vec4(2.9789467,2.4364579,5.2347264,0.),vec4(2.2270417,1.8825914,3.8028636,0.))*buf[7]+vec4(-1.5468478,-3.6171484,0.24762098,0.);
                buf[0]=sigmoid(buf[0]);
                return vec4(buf[0].x,buf[0].y,buf[0].z,1.);
            }

            void mainImage(out vec4 fragColor,in vec2 fragCoord){
                vec2 uv=fragCoord/uResolution.xy*2.-1.;
                uv.y*=-1.;
                uv+=uWarp*vec2(sin(uv.y*6.283+uTime*0.5),cos(uv.x*6.283+uTime*0.5))*0.05;
                fragColor=cppn_fn(uv,0.1*sin(0.3*uTime),0.1*sin(0.69*uTime),0.1*sin(0.44*uTime));
            }

            void main(){
                vec4 col;mainImage(col,gl_FragCoord.xy);
                
                if (uHasColor) {
                    // 1. Get the pattern intensity
                    float intensity = dot(col.rgb, vec3(0.299, 0.587, 0.114));
                    
                    // 2. Soft/Cloudy Curve (Fixes "Disgusting" Blob look)
                    // Instead of cutting it off, we let it fill the screen softly
                    intensity = pow(intensity, 1.5); 
                    
                    // 3. Deep Black -> Cyan Gradient
                    // Mix from pure black to the color based on the soft intensity
                    col.rgb = mix(vec3(0.0), uColor, intensity);
                    
                    // 4. Soft highlights
                    col.rgb += uColor * pow(intensity, 4.0) * 0.4;
                } else {
                    col.rgb=hueShiftRGB(col.rgb,uHueShift);
                }

                // Scanlines removed/reduced logic
                float scanline_val=sin(gl_FragCoord.y*uScanFreq)*0.5+0.5;
                col.rgb*=1.-(scanline_val*scanline_val)*uScan;
                col.rgb+=(rand(gl_FragCoord.xy+uTime)-0.5)*uNoise;
                gl_FragColor=vec4(clamp(col.rgb,0.0,1.0),1.0);
            }
        `;

        this.init();
    }

    // Helper to convert hex to rgb array [r, g, b] normalized 0-1
    hexToRgb(hex) {
        if (!hex) return null;
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255
        ] : null;
    }

    init() {
        if (typeof ogl === 'undefined') {
            console.error("DarkVeil: OGL library is not loaded or 'ogl' global is missing.");
            return;
        }

        this.renderer = new ogl.Renderer({
            dpr: Math.min(window.devicePixelRatio, 2),
            alpha: true,
            premultipliedAlpha: false
        });

        this.gl = this.renderer.gl;
        this.container.appendChild(this.gl.canvas);
        this.gl.canvas.classList.add('darkveil-canvas');

        this.geometry = new ogl.Triangle(this.gl);

        this.program = new ogl.Program(this.gl, {
            vertex: this.vertex,
            fragment: this.fragment,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new ogl.Vec2() },
                uHueShift: { value: this.options.hueShift },
                uNoise: { value: this.options.noiseIntensity },
                uScan: { value: this.options.scanlineIntensity },
                uScanFreq: { value: this.options.scanlineFrequency },
                uWarp: { value: this.options.warpAmount },
                uColor: { value: this.rgbColor ? new ogl.Vec3(this.rgbColor[0], this.rgbColor[1], this.rgbColor[2]) : new ogl.Vec3(0, 0, 0) },
                uHasColor: { value: !!this.rgbColor }
            }
        });

        this.mesh = new ogl.Mesh(this.gl, { geometry: this.geometry, program: this.program });

        window.addEventListener('resize', this.resize.bind(this));
        this.resize();

        this.startTime = performance.now();
        this.animate();
    }

    resize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.renderer.setSize(width * this.options.resolutionScale, height * this.options.resolutionScale);
        this.program.uniforms.uResolution.value.set(width, height);
    }

    animate() {
        const time = ((performance.now() - this.startTime) / 1000) * this.options.speed;
        this.program.uniforms.uTime.value = time;
        this.program.uniforms.uHueShift.value = this.options.hueShift;
        this.program.uniforms.uNoise.value = this.options.noiseIntensity;
        this.program.uniforms.uScan.value = this.options.scanlineIntensity;
        this.program.uniforms.uScanFreq.value = this.options.scanlineFrequency;
        this.program.uniforms.uWarp.value = this.options.warpAmount;

        this.renderer.render({ scene: this.mesh });
        this.animationFrame = requestAnimationFrame(this.animate.bind(this));
    }

    destroy() {
        cancelAnimationFrame(this.animationFrame);
        window.removeEventListener('resize', this.resize.bind(this));
        if (this.gl && this.gl.canvas && this.gl.canvas.parentElement) {
            this.gl.canvas.parentElement.removeChild(this.gl.canvas);
        }
    }
}

window.DarkVeil = DarkVeil;
