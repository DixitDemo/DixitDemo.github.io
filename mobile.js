// below is image part
function add(){
    $("#input_images").css('opacity', 0.0);
    $("#button_area").css('opacity', 0.0);

    document.getElementById("default_images_and_add").removeAttribute('hidden');
    put_image_pool()
}
function imageToDataUri(img, width, height) {

    // create an off-screen canvas
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');

    // set its dimension to target size
    canvas.width = width;
    canvas.height = height;

    // draw source image into the off-screen canvas:
    ctx.drawImage(img, 0, 0, width, height);

    // encode image to data-uri with base64 version of compressed image
    return canvas.toDataURL("image/jpeg");
}
function b64toBlob(b64Data, contentType, sliceSize) {
            contentType = contentType || '';
            sliceSize = sliceSize || 512;

            var byteCharacters = atob(b64Data);
            var byteArrays = [];

            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                            var slice = byteCharacters.slice(offset, offset + sliceSize);

                            var byteNumbers = new Array(slice.length);
                            for (var i = 0; i < slice.length; i++) {
                                                byteNumbers[i] = slice.charCodeAt(i);
                                            }

                            var byteArray = new Uint8Array(byteNumbers);

                            byteArrays.push(byteArray);
                        }

          var blob = new Blob(byteArrays, {type: contentType});
          return blob;
}

function submit(){
    //console.log('click submit');

    // remove previous state
    /*
    for (index=1; index <= 5; index ++){
        var usedFrameList = document.getElementById('usedFrameList'+String(index));
        while (usedFrameList.firstChild) {
            usedFrameList.removeChild(usedFrameList.firstChild);
        }
    }
    for (index=1; index <= 5; index ++){
        var sep_story = document.getElementById('sep_story'+String(index));
        sep_story.innerHTML = "";
    }
    */

    // order files
    var childs = document.getElementById("input_images").childNodes;
    var arr = []
    if (childs.length != 5) {
        alert("Must use 5 images");
        return;
    }
    for (let index=0; index < childs.length; index ++) {
        child = childs[index];
        console.log('child', child);
        if (child.id.startsWith("default")) {
            var img = document.getElementById(child.id);
            arr.push(child.src);
        }
        else {
			var ImageURL = child.src;
			// Split the base64 string in data and contentType
			var block = ImageURL.split(";");
			// Get the content type of the image
			var contentType = block[0].split(":")[1];// In this case "image/gif"
			// get the real base64 content of the file
			var realData = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."

			// Convert it to a blob to upload
			var blob = b64toBlob(realData, contentType);
			arr.push(blob);

        }
    }
    //console.log(arr)
    
    socket.emit("img", arr);
    
    $("#waiting_img").css("display", "block");
    $("#input_images").css('opacity', 0.25);
    $("#button_area").css('opacity', 0.25);
    
    
}
files = {}
var choose = document.getElementById('input_file');
FileAPI.event.on(choose, 'change', function (evt){
    console.log('event on choose!');
    tmp_files = FileAPI.getFiles(evt); // Retrieve file list
    console.log(tmp_files);

    FileAPI.filterFiles(
        tmp_files, 
        function (file, info/**Object*/){
            if( /^image/.test(file.type) ){
                return  true;
            }
            return  false;
        }, 
        function (tmp_files/**Array*/, rejected/**Array*/){
            // Make preview size x size;
            
            FileAPI.each(tmp_files, function (file){
                //files.push(file);
                console.log(files);
                var size = (document.getElementById("default_images").clientWidth) / 3.5;
                if (size > 178) {
                    size = 178;
                }
                console.log('size', size);
                console.log(file);
                FileAPI.Image(file).resize(256, 256, 'max').get(function (err, canvas){
                    
                    console.log('err', err);
                        
                    var imgsrc = canvas.toDataURL("image/jpeg");
                    var img = document.createElement("img");
                    img.src = imgsrc;
                    img.width = size;
                    img.height = size;
                    index = Object.keys(files).length;
                    img.id = String(index);
                    files[String(index)] = file;
                    
                    var default_images = document.getElementById("default_images");
                    img.className += 'un_select_image';
                    img.onclick = function(e){
                        if (this.classList.contains('un_select_image')){
                            this.classList.remove('un_select_image');
                            this.classList.add('selected_image');
                        }else if(this.classList.contains('selected_image')){
                            this.classList.remove('selected_image');
                            this.classList.add('un_select_image');
                        }
                    }
                    default_images.prepend(img);
                });
            });
            document.getElementById("input_file").value = "";
            
        }
    );
});

function add_from_device(){
    var input_file = document.getElementById("input_file");
    input_file.click();
    
    /*
    if (!navigator.mediaDevices) {
        alert ("Media device not supported. If you are on an iphone, please consider IOS 11 or above and using Safari.");
    }
    $("#camera_div").css("display", "flex");
    $("#default_images_and_add").css("display", "none");
    // use MediaDevices API
    // docs: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    var video = document.getElementById("camera_stream");
    var button = document.getElementById("camera_take_picture");
    button.disabled = false;
    var canvas = document.getElementById("camera_result");
    video.style.display = 'initial';
    canvas.style.display = 'none';
    var canvasWidth = video.offsetWidth, canvasHeight = video.offsetHeight;
    console.log('width', canvasWidth, 'height', canvasHeight);

    navigator.mediaDevices.getUserMedia({video: {width: 640, facingMode: "environment"}, })
        // permission granted:
        .then(function(stream) {
            video.srcObject = stream;
            video.play();
            button.onclick = function() {

                var context = canvas.getContext('2d');
                context.drawImage(video, 0, 0, canvasWidth, canvasHeight);
                video.style.display = 'none';
                canvas.style.display = 'initial';
                var imgsrc = canvas.toDataURL("image/jpeg");
                var img = document.createElement("img");
                img.src = imgsrc;
                var track = stream.getTracks()[0];
                track.stop();
                var default_images = document.getElementById("default_images");
                $("#camera_div").css("display", "none");
                $("#default_images_and_add").css("display", "initial");
                var size = (document.getElementById("default_images").clientWidth) / 3.5;
                img.width = size; 
                img.height = size; 
                img.className += 'un_select_image';
                img.onclick = function(e){
                    if (this.classList.contains('un_select_image')){
                        this.classList.remove('un_select_image');
                        this.classList.add('selected_image');
                    }else if(this.classList.contains('selected_image')){
                        this.classList.remove('selected_image');
                        this.classList.add('un_select_image');
                    }
                }
                default_images.prepend(img);

            }
        })
        // permission denied:
        .catch(function(error) {
            console.log('Could not access the camera. Error: ' + error.name + error.toString());
        });
        */
}
function use_these_images(){
    var images = document.getElementById("default_images").childNodes;
    var selected_images = [];
    for (let i=0; i<images.length; i++) {
        if (images[i].classList.contains('selected_image')){
            selected_images.push(images[i]);
        }
    }
    if (selected_images.length != 5){
        alert('Can only use 5 images');
        return;
    }
    else {
        var input_images = document.getElementById("input_images");
        var width = input_images.clientWidth*0.8;
        for (let i=0; i<selected_images.length; i++){
            var image = selected_images[i];
            image.classList.remove('selected_image');
            image.classList.add('used_image');
            image.width = width;
            image.height = width;
            input_images.appendChild(image);
        }
    }
    document.getElementById("default_images_and_add").hidden = true;
    $("#input_images").css('opacity', 1);
    $("#button_area").css('opacity', 1);
}



function put_image_pool(){
    var default_image = document.getElementById("default_images");
    for (var i=0; i<=27; i++){
        var dimg = document.createElement("img");
        dimg.className += 'un_select_image';
        dimg.setAttribute('src', 'default_images/'+i.toString()+'.jpg');
        dimg.setAttribute('id', 'default_images/'+i.toString()+'.jpg');
        var size = (document.getElementById("default_images").clientWidth) / 3.5;
        if (size > 178) {
            size = 178;
        }
        dimg.setAttribute('height', size.toString());
        dimg.setAttribute('width', size.toString());
        default_image.append(dimg);
        dimg.onclick = function(e){
            if (this.classList.contains('un_select_image')){
                this.classList.remove('un_select_image');
                this.classList.add('selected_image');
            }else if(this.classList.contains('selected_image')){
                this.classList.remove('selected_image');
                this.classList.add('un_select_image');
            }
        }
        
    }
}

// below is frame part

socket.on('frames', function (frameObjLists){
    $("#waiting_img").css("display", "none");
    $("#input_images").css("display", "none");
    $("#button_area").css('display', "none");
    $("#images_and_frames_and_buttons").css('display', "initial");

    // frameLists is list of list of frame
    console.log('receive frameLists:', frameObjLists);

    // put image and corresponding frames
    var images = document.getElementById("input_images").childNodes;
    images = Array.prototype.slice.call(images);
    
    var images_and_frames = document.getElementById("images_and_frames");
    for (let i=0; i<frameObjLists.length; i++){
        console.log('before', images);
        put_image_and_frame(images_and_frames, images[i], frameObjLists[i]);
        console.log('after', images);
    }
    
});

function put_image_and_frame(result_DOM, image, frameList){
    var div = document.createElement("div");
    div.className += 'image_and_frame';
    console.log(image);
    div.appendChild(image);
    for (let i=0; i<frameList.length; i++){
        var single_frame = document.createElement("div");
        single_frame.classList.add("single_frame");
        single_frame.innerHTML = frameList[i].name;
        div.appendChild(single_frame);
    }
    result_DOM.appendChild(div);
}

// below is story part
function generate_story(){
    var images_and_frames = document.getElementById("images_and_frames").childNodes;
    console.log(images_and_frames);
    images_and_frames = Array.prototype.slice.call(images_and_frames);
    console.log(images_and_frames);
    var framesList = [];
    for (let i=0; i<images_and_frames.length; i++){
        // image_and_frames is a div with a image and its corresponding frames
        const image_and_frames = images_and_frames[i];
        frames = image_and_frames.getElementsByClassName('single_frame');
        var arr = [];
        for (let j=0; j<frames.length; j++){
            frame = frames[j]
            frame_string = frame.innerHTML.split('<div>')[0];
            /*
            if (frame.classList.contains("noun_type")) {
                frame += "_NOUN";
            }
            else if (frame.classList.contains("frame_type")) {
                frame += "_Frame";
            }
            */
           arr.push(frame_string);
        }
        framesList.push(arr);
    }
    socket.emit("frames", framesList);
    $("#waiting_img").css("display", "block");
    $("#images_and_frames_and_buttons").css('opacity', 0.25);
}

socket.on('story', function (storys){
    $("#images_and_frames_and_buttons").css('display', "none");
    $("#waiting_img").css("display", "none");
    $("#gallery").css('display', "initial");
    $("body").css('display', 'initial');
    console.log('receive storys:', storys);
    
    var mySwiper = new Swiper ('.swiper-container', {
        // Optional parameters
        initialSlide: 2,
    
        // If we need pagination
        pagination: {
        el: '.swiper-pagination',
        },
    });
    const height = put_images();
    put_storys(height, storys);
    put_terms(height);       
});

function put_images(){
    var DOM = document.getElementById("show_images");
    var images_and_frames = document.getElementById("images_and_frames").childNodes;
    console.log(images_and_frames);
    images_and_frames = Array.prototype.slice.call(images_and_frames);
    const width = DOM.clientHeight*0.18;
    for (let i=0; i<images_and_frames.length; i++){
        // image_and_frames is a div with a image and its corresponding frames
        const image_and_frames = images_and_frames[i];
        var image = image_and_frames.getElementsByTagName('img')[0];
        console.log(image);
        image = image.cloneNode(true);
        image.width = width;
        image.height = width;
        image.classList.add('showing');
        DOM.appendChild(image);
    }
    var DOM = document.getElementById("show_images2");
    var images_and_frames = document.getElementById("images_and_frames").childNodes;
    images_and_frames = Array.prototype.slice.call(images_and_frames);
    for (let i=0; i<images_and_frames.length; i++){
        // image_and_frames is a div with a image and its corresponding frames
        const image_and_frames = images_and_frames[i];
        var image = image_and_frames.getElementsByTagName('img')[0];
        console.log(image);
        image = image.cloneNode(true);
        image.width = width;
        image.height = width;
        image.classList.add('showing');
        DOM.appendChild(image);
    }
    return width;
}

function put_terms(height){
    var DOM = document.getElementById("show_terms");
    
    var images_and_frames = document.getElementById("images_and_frames").childNodes;
    console.log(images_and_frames);
    images_and_frames = Array.prototype.slice.call(images_and_frames);
    for (let i=0; i<images_and_frames.length; i++){
        // image_and_frames is a div with a image and its corresponding frames
        const image_and_frames = images_and_frames[i];
        single_terms = image_and_frames.getElementsByClassName('single_frame');
        //console.log('single_terms', single_terms);
        var div = document.createElement("div");
        //div.style.width = height;
        div.style.height = height;
        div.classList.add('showing_terms');
        for (let j=0; j<single_terms.length; j++){
            single_term = single_terms[j];
            single_term = single_term.cloneNode(true);
            div.appendChild(single_term);
        }
        DOM.appendChild(div);
    }
}

function put_storys(height, storys){
    var DOM = document.getElementById("show_storys");
    var images_and_frames = document.getElementById("images_and_frames").childNodes;
    images_and_frames = Array.prototype.slice.call(images_and_frames);
    for (let i=0; i<images_and_frames.length; i++){
        // image_and_frames is a div with a image and its corresponding frames
        var div = document.createElement("div");
        //div.style.width = height;
        div.style.height = height;
        div.classList.add('showing');
        div.innerHTML = storys[i];
        DOM.appendChild(div);
    }
    
}
