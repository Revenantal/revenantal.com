function TestCamera(element)
{
    this.distance = 1;
    this._distance = 1;
    this.minDistance = -1;
    this.fov = 60;
    this.rotationX = 0;
    this.rotationY = 0;
    this._rotationX = 0;
    this._rotationY = 0;
    this._translationX = 0;
    this._translationY = 0;
    this._translationZ = 0;
    this.poi = vec3.create();
    this.nearPlane = 1;
    this.farPlane = 0;

    this.onShift = null;
    this.shift = 0;
    this.shiftStage = 0;
    this._shiftX = null;
    this.button = null;
    this.rightMouseMove = false;
    this._rightMouse = null;
    this._doReset = false;
    this.resetTime = 2;

    this.record = false;
    this.recorded = vec3.create();

    this._dragX = 0;
    this._dragY = 0;
    this._lastRotationX = 0;
    this._lastRotationY = 0;
    this._rotationSpeedX = 0;
    this._rotationSpeedY = 0;
    this._measureRotation = null;
    this._moveEvent = null;
    this._upEvent = null;
    this._prevScale = null;

    this._additionalRotationX = 0;
    this._additionalRotationY = 0;

    var self = this;
    this._lastTap = 0;
    this._resetTimeDone = 0;

    element.addEventListener('mousedown', function (event) { self._DragStart(event, element); }, false);
    element.addEventListener('touchstart', function (event) { self._DragStart(event, element); }, true);
    element.addEventListener('dblclick', function () {self._doReset = true; }, false);
    window.addEventListener('DOMMouseScroll', function (e) { return self._WheelHandler(e, element); }, false);
    window.addEventListener('mousewheel', function (e) { return self._WheelHandler(e, element); }, false);

    return this;
}

/**
 * Development function that sets default TestCamera options
 * @prototype
 */
TestCamera.prototype.setDefault = function()
{
    this.minDistance = 0;
    this.maxDistance = 1000000;
    this.fov = 30;
    this.distance = 5000;
    this.nearPlane = 1;
    this.farPlane = 10000000;
    this.minPitch = -0.5;
    this.maxPitch = 0.65;
    return this;
};

/**
 * Sets the focus of the camera to a position in space at a set distance
 * @param {Vector3} vector3
 * @param {number} distance
 */
TestCamera.prototype.setFocus = function(vector3, distance)
{
    this.poi[0] = vector3[0];
    this.poi[1] = vector3[1];
    this.poi[2] = vector3[2];
    this.distance = distance;
    return this;
};

/*
 * Sets the cameras translation
 * @param {vec3} vector3
 * @returns {TestCamera}
 */
TestCamera.prototype.setTranslation = function(vector3)
{
    this._translationX = vector3[0];
    this._translationY = vector3[1];
    this._translationZ = vector3[2];
    return this;
}


/**
 * Gets camera translation
 * @param {vec3} [vector3] optional receiving vector
 * @returns {vec3}
 */
TestCamera.prototype.getTranslation = function(out)
{
    vector3 || ( vector3 = vec3.create());
    vector3[0] = this._translationX;
    vector3[1] = this._translationY;
    vector3[2] = this._translationZ;
    return vector3;
}

TestCamera.prototype.getView = function ()
{
    var view = mat4.create();
    mat4.identity(view);
    mat4.rotateY(view, -this.shift);
    mat4.translate(view, [0, 0.0, -(this.distance + this._distance)]);
    mat4.rotateX(view, this.rotationY + this._rotationY + this._additionalRotationY);
    mat4.rotateY(view, this.rotationX + this._rotationX + this._additionalRotationX);
    mat4.translate(view, [-this.poi[0] + this._translationX , -this.poi[1] - this._translationY, -this.poi[2] + this._translationZ]);
    return view;
}

TestCamera.prototype.getProjection = function (aspect)
{
    var projection = mat4.create();
    mat4.perspective(this.fov, aspect, this.nearPlane, this.farPlane > 0 ? this.farPlane : (this.distance + this._distance) * 2, projection);
    return projection;
}


TestCamera.prototype.getInvView = function()
{
    return mat4.inverse(this.getView());
}


TestCamera.prototype.getViewProjectionMatrix = function(aspect)
{
    return mat4.multiply(
        this.getProjection(aspect),
        this.getView()
    )
};

TestCamera.prototype.getInvViewProjectionMatrix = function(aspect)
{
    return mat4.inverse(mat4.multiply(this.getProjection(aspect), this.getView()));
}

TestCamera.prototype.unproject = function (wX, wY, wZ)
{
    if (wZ !== undefined)
    {
        var vp = [0, 0, ccpwgl_int.device.viewportWidth, ccpwgl_int.device.viewportHeight];

        var inf = quat4.create()
        inf[0] = (wX - vp[0]) / vp[2] * 2.0 - 1.0;
        inf[1] = 1 - (wY - vp[1]) / vp[3] * 2.0 ;
        inf[2] = 2.0 * wZ - 1.0;
        inf[3] = 1.0;

        var out = mat4.multiplyVec4(camera.getInvViewProjectionMatrix(vp[2]/vp[3]), inf);
        if (out[3] == 0.0) { return null;}
        out[3] = 1.0 / out[3];
        return [out[0] * out[3], out[1] * out[3], out[2] * out[3]];
    }

    return [ this.unproject(wX, wY, 0), this.unproject(wX, wY, 1) ];
}

TestCamera.prototype.recordDrag = function ()
{
    this.record = true;
}

TestCamera.prototype.recordStop = function ()
{
    this.recorded = [0,0,0];
    this.record = false;
}

TestCamera.prototype.getRecorded = function ()
{
    console.log(this.recorded);
    return this.recorded;
}


TestCamera.prototype.update = function (dt)
{
    //console.log(this.record);
    this._rotationX += this._rotationSpeedX * dt;
    this._rotationSpeedX *= 0.9;
    this._rotationY += this._rotationSpeedY * dt;
    this._rotationSpeedY *= 0.9;
    if ((this.rotationY + this._rotationY )< -Math.PI / 2)
    {
        this._rotationY = (-Math.PI / 2) - this.rotationY;
    }
    if ((this.rotationY + this._rotationY )> Math.PI / 2)
    {
        this._rotationY = (Math.PI / 2) - this.rotationY;
    }
    if (this.shiftStage == 2)
    {
        this.shift += this.shift * dt * 5;
        if (Math.abs(this.shift) > 2)
        {
            this.onShift(1, this.shift > 0);
            //this.shift = -this.shift;
            //this._shiftOut = false;
        }
    }
    else if (this.shiftStage == 1)
    {
        this.shift -= this.shift * Math.min(dt, 0.5) * 2;
    }
    if (this._doReset) {
        this._rotationX = this._rotationX *(1-(Math.pow(this._resetTimeDone/this.resetTime, 3)));
        this._rotationY = this._rotationY * (1-(Math.pow(this._resetTimeDone/this.resetTime, 3)));
        this._distance = this._distance * (1-(Math.pow(this._resetTimeDone/this.resetTime, 3)));
        this._translationX = this._translationX * (1-(Math.pow(this._resetTimeDone/this.resetTime, 3)));
        this._translationY = this._translationY * (1-(Math.pow(this._resetTimeDone/this.resetTime, 3)));
        this._translationZ = this._translationZ * (1-(Math.pow(this._resetTimeDone/this.resetTime, 3)));
        this._resetTimeDone += dt;
        if (this._resetTimeDone >= this.resetTime) {
            this._rotationX = 0;
            this._rotationY = 0;
            this._distance = 0;
            this._translationX = 0;
            this._translationY = 0;
            this._translationZ = 0;
            this._resetTimeDone = 0;
            this._doReset = false;
        }
    }
}

TestCamera.prototype._DragStart = function (event, element)
{

    if (!event.touches && !this.onShift && event.button != 0 && event.button != 2)
    {
        return;
    }
    if (this._moveEvent || this._upEvent)
    {
        return;
    }
    this.button = event.button;
    if (this.rightMouseMove && this._rightMouse == null) {
        element.addEventListener('contextmenu', this._rightMouse = function(e) {e.preventDefault(); e.stopPropagation(); return(false);});
    }
    var self = this;
    if (this._moveEvent == null)
    {
        document.addEventListener("mousemove", this._moveEvent = function (event) { self._DragMove(event); }, true);
        document.addEventListener("touchmove", this._moveEvent, true);
    }
    if (this._upEvent == null)
    {
        document.addEventListener("mouseup", this._upEvent = function (event) { self._DragStop(event); }, true);
        document.addEventListener("touchend", this._upEvent, true);
    }
    event.preventDefault();
    if (event.touches)
    {
        event.screenX = event.touches[0].screenX;
        event.screenY = event.touches[0].screenY;
    }
    this._dragX = event.screenX;
    this._dragY = event.screenY;
    this._shiftX = null;
    this._rotationSpeedX = 0;
    this._lastRotationX = this._rotationX;
    this._rotationSpeedY = 0;
    this._lastRotationY = this._rotationY;

    if (event.touches)
    {
        if (event.touches.length == 1) {
            var now = new Date().getTime();
            var timesince = now - this._lastTap;
            if((timesince < 300) && (timesince > 0)){
                this._lastRotationX = 0;
                this._lastRotationY = 0;
                this._doReset = true;
            }
            this._lastTap = new Date().getTime();
        }
    }


}

TestCamera.prototype._MeasureRotation = function ()
{
    var self = this;
    this._lastRotationX = this._rotationX;
    this._lastRotationY = this._rotationY;
    this._measureRotation = setTimeout(function() { self._MeasureRotation(); }, 500);
}

TestCamera.prototype._DragMove = function (event)
{
    if (this.onShift && (event.touches && event.touches.length > 2 || !event.touches && event.button != 0))
    {
        this.shiftStage = 0;
        event.preventDefault();
        if (event.touches)
        {
            event.screenX = 0;
            event.screenY = 0;
            for (var i = 0; i < event.touches.length; ++i)
            {
                event.screenX += event.touches[i].screenX;
                event.screenY += event.touches[i].screenY;
            }
            event.screenX /= event.touches.length;
            event.screenY /= event.touches.length;
        }
        if (this._shiftX !== null)
        {
            this.shift += (event.screenX - this._shiftX) / device.viewportWidth * 2;
        }
        this._shiftX = event.screenX;
        return;
    }
    this._shiftX = null;
    if (event.touches)
    {
        if (event.touches.length == 2)
        {
            event.preventDefault();
            var dx = event.touches[0].screenX - event.touches[1].screenX;
            var dy = event.touches[0].screenY - event.touches[1].screenY;
            var scale = Math.sqrt(dx * dx + dy * dy);
            if (this._prevScale != null)
            {
                var delta = (this._prevScale - scale) * 0.03;
                this._distance = this._distance + delta * (this.distance + this._distance) * 0.1;
                if ((this.distance + this._distance) < this.minDistance)
                {
                    this._distance = this.minDistance - this.distance;
                }
                if ((this.distance + this._distance) > this.maxDistance)
                {
                    this._distance = this.maxDistance - this.distance;
                }
            }
            this._prevScale = scale;
            return;
        }
        if (event.touches.length == 3)
        {
            event.preventDefault();
            var dTranslationX = -(this._dragX - event.touches[0].screenX) * (this.distance + this._distance)/850;
            this._dragX = event.touches[0].screenX;
            var dTranslationY = -(this._dragY - event.touches[0].screenY) * (this.distance + this._distance)/850;
            this._dragY = event.touches[0].screenY;
            this._translationX += Math.cos(this.rotationX + this._rotationX) * dTranslationX - Math.sin(this.rotationX + this._rotationX) * Math.sin(this.rotationY + this._rotationY) * dTranslationY;
            this._translationY += Math.sin(this.rotationY + this._rotationY) * Math.cos(this.rotationX + this._rotationX) * dTranslationX + Math.cos(this.rotationY + this._rotationY) * dTranslationY;
            this._translationZ += Math.sin(this.rotationX + this._rotationX) * dTranslationX + Math.cos(this.rotationX + this._rotationX) * Math.sin(this.rotationY + this._rotationY) * dTranslationY;
            return;
        }
        if (event.touches.length > 3)
        {
            event.preventDefault();
            return;
        }
        event.screenX = event.touches[0].screenX;
        event.screenY = event.touches[0].screenY;
    }
    if ((typeof (event.screenX) != 'undefined') && (event.touches || (this.button == 0 && !(event.altKey))))
    {
        var dRotation = -(this._dragX - event.screenX) * 0.01;
        this._rotationX += dRotation;
        this._dragX = event.screenX;
        dRotation = -(this._dragY - event.screenY) * 0.01;
        this._rotationY += dRotation;
        this._dragY = event.screenY;
        if ((this.rotationY + this._rotationY )< -Math.PI / 2)
        {
            this._rotationY = (-Math.PI / 2) - this.rotationY;
        }
        if ((this.rotationY + this._rotationY )> Math.PI / 2)
        {
            this._rotationY = (Math.PI / 2) - this.rotationY;
        }
    }
    if ((typeof (event.screenX) != 'undefined') && ((this.button == 2) || (this.button == 0 && event.altKey )))
    {
        var dTranslationX = -(this._dragX - event.screenX) * (this.distance + this._distance)/850;
        this._dragX = event.screenX;
        var dTranslationY = -(this._dragY - event.screenY) * (this.distance + this._distance)/850;
        this._dragY = event.screenY;
        if (!this.record) {
            this._translationX += Math.cos(this.rotationX + this._rotationX) * dTranslationX - Math.sin(this.rotationX + this._rotationX) * Math.sin(this.rotationY + this._rotationY) * dTranslationY;
            this._translationY += Math.sin(this.rotationY + this._rotationY) * Math.cos(this.rotationX + this._rotationX) * dTranslationX + Math.cos(this.rotationY + this._rotationY) * dTranslationY;
            this._translationZ += Math.sin(this.rotationX + this._rotationX) * dTranslationX + Math.cos(this.rotationX + this._rotationX) * Math.sin(this.rotationY + this._rotationY) * dTranslationY;
        }
        else {
            this.recorded[0] = Math.cos(this.rotationX + this._rotationX) * dTranslationX - Math.sin(this.rotationX + this._rotationX) * Math.sin(this.rotationY + this._rotationY) * dTranslationY;
            this.recorded[1] = Math.sin(this.rotationY + this._rotationY) * Math.cos(this.rotationX + this._rotationX) * dTranslationX + Math.cos(this.rotationY + this._rotationY) * dTranslationY;
            this.recorded[2] = Math.sin(this.rotationX + this._rotationX) * dTranslationX + Math.cos(this.rotationX + this._rotationX) * Math.sin(this.rotationY + this._rotationY) * dTranslationY;
        }
    }

}

TestCamera.prototype._DragStop = function (event)
{
    event.preventDefault();
    clearTimeout(this._measureRotation);
    document.removeEventListener("mousemove", this._moveEvent, true);
    document.removeEventListener("mouseup", this._upEvent, true);
    document.removeEventListener("touchmove", this._moveEvent, true);
    document.removeEventListener("touchend", this._upEvent, true);
    this._moveEvent = null;
    this._upEvent = null;
    var dRotation = this._rotationX - this._lastRotationX;
    this._rotationSpeedX = dRotation * 0.5;
    dRotation = this._rotationY - this._lastRotationY;
    this._rotationSpeedY = dRotation * 0.5;
    this._prevScale = null;
    if (this.onShift)
    {
        if (Math.abs(this.shift) > 0.5)
        {
            this.shiftStage = 2;
            this.onShift(0, this.shift > 0);
        }
        else
        {
            this.shiftStage = 1;
        }
    }
    if (this.record)
    {
        this.record=false;
    }
}

TestCamera.prototype._WheelHandler = function (event, element)
{
    var delta = 0;
    if (!event) /* For IE. */
        event = window.event;
    var source = null;
    if (event.srcElement)
    {
        source = event.srcElement;
    }
    else
    {
        source = event.target;
    }
    if (source != element)
    {
        return false;
    }
    if (event.wheelDelta)
    { /* IE/Opera. */
        delta = event.wheelDelta / 120;
        /** In Opera 9, delta differs in sign as compared to IE.
         */
        if (window.opera)
            delta = -delta;
    } else if (event.detail)
    { /** Mozilla case. */
        /** In Mozilla, sign of delta is different than in IE.
         * Also, delta is multiple of 3.
         */
        delta = -event.detail / 3;
    }
    /** If delta is nonzero, handle it.
     * Basically, delta is now positive if wheel was scrolled up,
     * and negative, if wheel was scrolled down.
     */
    if (delta)
    {
        this._distance = this._distance + delta * (this.distance + this._distance) * 0.1;
        if ((this.distance + this._distance) < this.minDistance)
        {
            this._distance = this.minDistance - this.distance;
        }
        if ((this.distance + this._distance) > this.maxDistance)
        {
            this._distance = this.maxDistance - this.distance;
        }
    }
    /** Prevent default actions caused by mouse wheel.
     * That might be ugly, but we handle scrolls somehow
     * anyway, so don't bother here..
     */
    if (event.preventDefault)
        event.preventDefault();
    event.returnValue = false;
    return false;
}