import { SkyBox } from '../sky-box.js'
import * as THREE from 'three'

const textTime = document.querySelector('.text-time')
const icon = document.querySelector('.icon')

var flag = 99;

export function updateCurrentTime(three) {
    setInterval(function () {
        let today = new Date()
        var my_hour = today.getMinutes() % 24 
        var my_minute = today.getSeconds()
        var time = my_hour + " : " + my_minute
        textTime.innerHTML = time
        //toi
        if (flag != 3 && my_hour == 19) {
            flag = setAtNight(three)
        }
        //sang
        else if (flag != 0 && my_hour == 5) {
            flag = setAtMorning(three)
        }
        //trua
        else if (flag != 1 && my_hour == 11) {
            flag = setAtAfternoon(three)
        }
        //chieu
        else if (flag != 2 && my_hour == 16) {
            flag = setAtEvening(three)
        }
    }, 5000)
}



export function changeBackground(three, hour) {
    // toi
    if (hour <= 4 || hour >= 19) {
        flag = setAtNight(three)
        console.log('set night');
    }
    // sang
    else if (hour <= 10) {
        flag = setAtMorning(three)
        console.log('set morni');

    }
    // trua
    else if (hour <= 15) {
        flag = setAtAfternoon(three)
        console.log('set after');

    }
    // chieu
    else {
        flag = setAtEvening(three)
        console.log('set eve');

    }
}

function setAtMorning(three) {
    console.log('morning');
    three.ambientLight.intensity = 0.2
    three.ambientLight.color.setHex(0xe1e1e1);
    three.directionalLight.position.set(20, 40, 0);
    three.directionalLight.color.setHex(0xc75c5c);
    three.directionalLight.intensity = .3
    var fogColor = new THREE.Color(0xffffff);
    three.scene.background = fogColor;
    three.scene.fog = new THREE.FogExp2(fogColor, .02);
    icon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 60px; width: 60px;">
    <g class="" transform="translate(0,6)" style="">
        <path
            d="M259.375 16.25c-132.32 0-239.78 107.46-239.78 239.78s107.46 239.783 239.78 239.783 239.78-107.462 239.78-239.782-107.46-239.78-239.78-239.78zm33.5 20.406c26.563 4.015 51.57 12.708 74.156 25.25L308.907 209.03c-14.573-7.215-30.96-11.344-48.312-11.53l32.28-160.844zm-67.72.094l23.97 161.22c-17.2 1.56-33.28 6.986-47.313 15.436l-51-151c22.616-12.698 47.696-21.54 74.344-25.656zm193.25 64.5c17.683 18.164 32.28 39.32 42.94 62.688l-107.658 85.468c-8.9-14.076-20.863-26.014-34.968-34.875l99.686-113.28zm-319.092 1.063L192.5 219.686c-13.318 9.978-24.317 22.88-32.063 37.75L56.5 166c10.527-23.725 25.082-45.226 42.813-63.688zm378.75 115.906c2.105 12.286 3.218 24.92 3.218 37.81 0 11.49-.882 22.768-2.56 33.783l-107.876 16.062c-.463-17.028-4.757-33.097-12-47.375l119.22-40.28zM40.25 221.093l115.844 45.75c-4.918 12.077-7.81 25.224-8.188 39l-107.844-16.03c-1.678-11.016-2.562-22.295-2.562-33.783 0-11.89.954-23.554 2.75-34.936zm130.563 89.53h177.125L467 334.532c-31.674 83.843-112.62 143.376-207.625 143.376-95.018 0-175.968-59.548-207.625-143.406l119.063-23.875z"
            fill="#f8e71c" fill-opacity="1"
            transform="translate(128, 128) scale(0.5, 0.5) rotate(0, 256, 256) skewX(0) skewY(0)">
        </path>
    </g>
    </svg>
    `
    return 0
}

function setAtAfternoon(three) {
    console.log('afternoon');
    three.ambientLight.intensity = 0.4
    three.ambientLight.color.setHex(0xff9a00);
    three.directionalLight.position.set(-20, 40, 0);
    three.directionalLight.color.setHex(0xffffff);
    three.directionalLight.intensity = 1
    const skyboxModel = new SkyBox('miramar');
    three.scene.background = skyboxModel.skybox
    icon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 60px; width: 60px;">
    <g class="" transform="translate(0,6)" style="">
        <path
            d="M320.063 19.72c-72.258 14.575-19.248 71.693-74.344 108.81 4.846-.49 9.746-.702 14.655-.624 16.288.26 32.785 3.72 48.594 10.72 4.96 2.196 9.723 4.667 14.25 7.405 12.107-47.476-37.103-96.38-3.158-126.31zM136.75 44.47c-40.76 61.357 36.984 64.33 24.406 129.405 17.407-21.255 41.17-35.9 67.156-42.313-25.006-42.138-94.4-41.924-91.562-87.093zm297.313 75.405c-32.547.872-45.475 46.314-96.594 36.22 21.35 17.42 36.034 41.25 42.467 67.31 42.306-24.92 42.053-94.466 87.282-91.624-13.43-8.92-24.06-12.15-33.158-11.905zm-177.97 26.656c-23.656.46-46.53 8.82-64.906 23.626l18.657 36.156L170 193.156c-3.576 5.264-6.737 10.908-9.406 16.938-8.726 19.708-11.002 40.59-7.78 60.344l44.78 2.125-34 30.312c10.798 20.622 28.414 37.852 51.406 48.03 3.077 1.364 6.186 2.574 9.313 3.626l24.53-38.25 9.095 43.814c27.3.075 53.737-10.387 73.593-29.188l-19.186-37.125 38.406 12.658c1.822-3.188 3.512-6.506 5.03-9.938 9.746-22.01 11.457-45.498 6.44-67.22l-37.626-1.75 27.687-24.718c-10.83-20.194-28.236-37.07-50.874-47.093-1.37-.607-2.745-1.176-4.125-1.72l-25.874 40.313-9.906-47.75c-.5-.016-1-.023-1.5-.032-1.3-.02-2.61-.024-3.906 0zM133.407 186.5c-41.652.725-82.483 34.847-108.72 5.094 14.573 72.234 71.664 19.3 108.783 74.312-2.154-20.972.934-42.758 10.06-63.375 2.178-4.915 4.637-9.604 7.345-14.093-5.822-1.47-11.642-2.038-17.47-1.937zm249.5 53.97c2.204 21.047-.867 42.926-10.03 63.624l-.188.375c-2.143 4.796-4.57 9.393-7.22 13.78 47.524 12.244 96.507-37.137 126.47-3.156-14.603-72.388-71.92-19.04-109.032-74.625zM136.53 283.405c-42.123 25.014-41.928 94.37-87.093 91.53 61.422 40.803 64.322-37.123 129.594-24.342-21.344-17.385-36.03-41.167-42.5-67.188zm219.064 48.906c-17.406 21.46-41.236 36.24-67.344 42.72 24.944 42.263 94.497 42.004 91.656 87.218 40.867-61.52-37.402-64.358-24.312-129.938zM193.406 360.72c-12.047 47.456 37.087 96.33 3.156 126.25 72.305-14.587 19.195-71.79 74.47-108.908-21.04 2.204-42.898-.9-63.594-10.062-4.884-2.162-9.57-4.594-14.032-7.28z"
            fill="#f8e71c" fill-opacity="1"
            transform="translate(128, 128) scale(0.5, 0.5) rotate(0, 256, 256) skewX(0) skewY(0)">
        </path>
    </g>
    </svg>
    `
    return 1
}

function setAtEvening(three) {
    three.ambientLight.intensity = 0.1
    three.ambientLight.color.setHex(0xfff);
    three.directionalLight.position.set(-100, 40, 0);
    three.directionalLight.color.setHex(0xc75c5c);
    three.directionalLight.intensity = 1
    const skyboxModel = new SkyBox('gloomy');
    three.scene.background = skyboxModel.skybox
    icon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 60px; width: 60px;">
    <g class="" transform="translate(0,6)" style="">
        <path
            d="M247 27v80h18V27h-18zm-63.992 53.602l-16.631 6.886 15.309 36.955 16.628-6.886-15.306-36.955zm145.984 0l-15.306 36.955 16.628 6.886 15.309-36.955-16.63-6.886zM77.795 92.068l-12.727 12.727 56.569 56.568 12.726-12.726-56.568-56.569zm356.41 0l-56.568 56.569 12.726 12.726 56.569-56.568-12.727-12.727zM256 145.994a118.919 118.919 0 0 0-59.5 15.95c-34.215 19.754-56.177 55.048-59.129 94.056H374.63c-2.952-39.008-24.914-74.302-59.129-94.057a118.919 118.919 0 0 0-59.5-15.949zM66.488 195.377l-6.886 16.63 36.955 15.307 6.886-16.628-36.955-15.31zm379.024 0l-36.955 15.309 6.886 16.628 36.955-15.306-6.886-16.631zM24 274v18h464v-18H24zm200 62v64h-32l64 80 64-80h-32v-64h-64z"
            fill="#f8e71c" fill-opacity="1"
            transform="translate(128, 128) scale(0.5, 0.5) rotate(0, 256, 256) skewX(0) skewY(0)">
        </path>
    </g>
    </svg>
    `
    return 2
}

function setAtNight(three) {
    three.scene.background = null
    three.ambientLight.intensity = 0.3
    three.ambientLight.color.setHex(0xffffff);
    three.directionalLight.position.set(20, 40, 0);
    three.directionalLight.color.setHex(0xc75c5c);
    three.directionalLight.intensity = 0.2
    icon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 60px; width: 60px;">
    <g class="" transform="translate(0,6)" style="">
        <path
            d="M294.8 26.57L238 60.37l7.8 13.17L281 52.59 270.8 118l6.3 10.6L336 93.53l-7.8-13.17-37.3 22.14L301 37.12l-6.2-10.55zM147.1 60.55A224 224 0 0 0 32 256a224 224 0 0 0 224 224 224 224 0 0 0 214.9-161.2A208 208 0 0 1 320 384a208 208 0 0 1-208-208 208 208 0 0 1 35.1-115.45zm244.5 52.05l-6.9 16.5 44.1 18.4-68.3 35.9-5.5 13.2 73.7 30.8 6.9-16.5-46.7-19.5 68.3-35.9 5.5-13.2-71.1-29.7zm-115 64l-97.8 35 8.1 22.7 60.6-21.7-35.4 97.9 6.5 18.1L320 292.4l-8.1-22.7-64.2 23 35.4-97.9-6.5-18.2z"
            fill="#ffffff" fill-opacity="1"
            transform="translate(128, 128) scale(0.5, 0.5) rotate(0, 256, 256) skewX(0) skewY(0)">
        </path>
    </g>
    </svg>
    `
    return 3
}