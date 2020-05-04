var progress = 0;

function addProgress(value)
{
    progress+=value;
    setProgress(progress);
}

function resetProgress()
{
    progress = 0;
    setProgress(progress);
}


function setProgress(value) {
    let bar = document.getElementById('progressInside');
    let outer = document.getElementById('progressBar');
    if (value >= 100) { 
        bar.style.display='none';
        outer.style.display='none';
    } else {
        outer.style.display='block';
        bar.style.display = 'block';
        bar.style.width = value + "%";
    }
}