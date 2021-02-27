import * as bodyPix from '@tensorflow-models/body-pix'; 

const CAMERA = {
    audio: false,
    video: {
        height: {ideal: 315},
        width: {ideal: 560},
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

    const mediaStream = await navigator.mediaDevices.getUserMedia(CAMERA);

    const net = await bodyPix.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: .75,
        quantBytes: 2
    });


}

main();