import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';
import * as bodyPix from '@tensorflow-models/body-pix'; 

const CAMERA = {
    audio: false,
    video: {
        height: {ideal: 200},
        width: {ideal: 200},
        facingMode: 'user'
    }
}

const checkCamera = () => {
    if (navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) return true;
    return false
}

const main = async () => {
    if (!checkCamera()) {
        alert("Not support");
        return;
    }

    const net = await bodyPix.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: .75,
        quantBytes: 2
    });

    const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    const video: HTMLVideoElement = document.getElementById('video') as HTMLVideoElement;

    document.getElementById('pannel').addEventListener('click', (e) => {
        // @ts-ignore
        switch(e.target.id) {
            case 'top-left':
                canvas.style.left = '8';
                canvas.style.top = '0';
                break;
            case 'top-right':
                canvas.style.left = '368';
                canvas.style.top = '0';
                break;
            case 'bottom-left':
                canvas.style.left = '8';
                canvas.style.top = '115';
                break;
            case 'bottom-right':
                canvas.style.left = '368';
                canvas.style.top = '115';
                break;
            default:
                break;
        }
    })

    const mediaStream = await navigator.mediaDevices.getUserMedia(CAMERA);

    video.srcObject = mediaStream;

    const offCanvas: HTMLCanvasElement = document.getElementById('side-canvas') as HTMLCanvasElement;
    
    const offCtx = offCanvas.getContext('2d');
    const ctx = canvas.getContext('2d');
    const draw = async () => {
        offCtx.drawImage(video, 0, 0);
        const res = await net.segmentPerson(offCanvas);
        document.getElementById('i').style.display = 'none';
        tf.tidy(() => {
            const maskTensor = tf.tensor3d(res.data, [200, 200, 1]);
            const imageTensor = tf.browser.fromPixels(offCanvas);
            const t1 = tf.mul(imageTensor, maskTensor) as tf.Tensor3D;
            const t2 = tf.concat([t1, tf.mul(maskTensor, 255)], 2);
            t2.data().then((rawData) => {
                const rawImageData = new ImageData(new Uint8ClampedArray(rawData), 200, 200);
                ctx.putImageData(rawImageData, 0, 0);
                ctx.scale(-1, 1);
                ctx.translate(-canvas.width, 0);
            });
        })

        requestAnimationFrame(draw);
    }
    setTimeout(() => {
        requestAnimationFrame(draw);
    });
}

main();