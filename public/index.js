window.addEventListener('load', function () {
    AddListeners();
}, false);

function AddListeners() {
    $("#submit-button").on('click', (e) => {
        fetchCelebrity();
    });

    $("#train-button").on('click', (e) => {
        trainModel();
    });
}

async function fetchCelebrity() {
    $("#response-box").css("display", "none");

    let photoInput = $("#image-input")[0];
    let photoFile = photoInput.files[0];

    let photoB64 = await toBase64(photoFile);

    $.ajax({
        type: "POST",
        url: "https://europe-west1-proiect-ppc-374618.cloudfunctions.net/api/whoami",
        data: { "image": photoB64 },
        success: function(data) {
            let message = JSON.parse(data).name;
            $("#response-box").css("display", "block");
            $("#response-text").html(message);
        },
        error: function (errorThrown) {
            let message = JSON.parse(errorThrown.responseText).message
            $("#response-box").css("display", "block");
            $("#response-text").html(message);
        }
    });
}

async function trainModel() {
    $("#response-box").css("display", "none");

    let celebrityName = $("#name-input").val();

    let photoInput = $("#train-input")[0];
    let photoFile = photoInput.files[0];

    let photoB64 = await toBase64(photoFile);

    $.ajax({
        type: "POST",
        url: "https://europe-west1-proiect-ppc-374618.cloudfunctions.net/api/admin/train",
        data: { "name": celebrityName, "image": photoB64 },
        success: function(data) {
            console.log(data);
            let message = JSON.parse(data).message
            $("#response-train-box").css("display", "block");
            $("#response-train-text").html(message);
        },
        error: function (errorThrown) {
            let message = JSON.parse(errorThrown.responseText).message
            $("#response-train-box").css("display", "block");
            $("#response-train-text").html(message);
        }
    });
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = error => reject(error);
});