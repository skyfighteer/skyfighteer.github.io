/* init */

const $ = document.querySelector.bind(document);
const zip = new JSZip();
let result;
let fileInput;
let fileName;

window.onload = function() {
    result = $('#result');
    fileInput = $('#fileInput');
    fileInput.onchange = () => {
        const file = fileInput.files[0];
        fileName = file.name;
        zip.loadAsync(file).then(handleFile, handeFileError);
    };
};

/* handling file */

function handleFile(f) {
    handleFileSuccess();
    generateNewFile(f).then(download)
    .catch((e) => onError(e));  
};

function generateNewFile(f) {
    return new Promise((res, rej) => {
        const XML = f.folder("ppt").file("presentation.xml");
        if (XML) {
            XML.async('string').then((data)=> {
                if (data.includes('modifyVerifier')) {
                    const newData = removeProtection(data);
                    replaceFile(f, newData);
                    res();
                } else rej('File is not read-only locked.');
            })
        } else rej('File is not an \'Office Open XML\' file.');
    });
};

function removeProtection(data) {
    try {
        const regex = /<p:modifyVerifier.*\/>/;
        return data.replace(regex, '');
    } catch(e) {
        console.log(e);
        return ('Could not remove protection.');
    }
};

function replaceFile(f, newContent) {
    try {
        f.folder("ppt").file("presentation.xml", newContent);
    } catch(e) {
        console.log(e);
        return ('There was an error while trying to replace the file.');
    };
};

function download() {
    zip.generateAsync({type:"blob"}).then((newFile)=> saveAs(newFile, fileName));
    cleanup();
};

/* helper */

function cleanup() {
    fileInput.value = "";
};


function handleFileSuccess() {
    // todo remove loading spinner
    result.classList.add('hidden');
    result.innerText = "";
};

function handeFileError() {
    onError('File format is unsupported.'); // file is not a (supported) compressed file
};

function onError(message) {
    result.classList.remove('hidden');
    result.innerText = message;
};