import { SkyBox } from '../sky-box.js'
import * as THREE from 'three'

const location = document.querySelector('#location')

export function updatePosition(three) {
    if (three.camera.position['x'] > -50 && three.camera.position['x'] < 50
        && three.camera.position['z'] > -50 && three.camera.position['z'] < 50) {
            location.innerHTML = 'Trung Đô'
    } else {
        location.innerHTML = 'Chưa xác định'
    }
}