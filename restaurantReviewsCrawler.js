var baseUrl = document.location.href;
var doc;
var totalReviews = 0;
var reviewsCounter = 0;
var reviews = ['from,when,rating,title,review'];
var reviewsPointer = 0;
var goToNextPage = true;

function crawler(baseUrl) {
    var flag=true;
    let xmlHTTP;
    xmlHTTP = new XMLHttpRequest(); 
    xmlHTTP.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200)    {
            doc = document.implementation.createHTMLDocument("doc");
            doc.write(this.responseText);
            if (flag) {
                totalReviews = parseInt(document.getElementsByClassName('reviews_header_count')[0].textContent.substr(1).split(')')[0]);
                flag = false;
            }
            curReviews = doc.getElementsByClassName('review-container');
            nofCurReviews = curReviews.length;
            for (let i=0; i<curReviews.length; i++) {
                from = curReviews[i].getElementsByClassName('info_text pointer_cursor')[0].firstElementChild.textContent;
                rating = (parseInt(curReviews[i].getElementsByClassName('ui_bubble_rating')[0].classList[1].substr(7)))/10;
                when = curReviews[i].getElementsByClassName('ratingDate')[0].title;
                title = curReviews[i].getElementsByClassName('noQuotes')[0].textContent;
                review = curReviews[i].getElementsByClassName('partial_entry')[0].textContent;
                if (curReviews[i].getElementsByClassName('entry')[0].childElementCount == 2)
                    review += curReviews[i].getElementsByClassName('postSnippet')[0].textContent;
                reviews[++reviewsPointer] =   from.replaceAll(',',' ') + ',' + when.replaceAll(',',' ') + ',' + rating + ',' + title.replaceAll(',', ' ') + ',' + (review.replaceAll(',', ' ')).replaceAll('\n','');
                goToNextPage = doc.getElementsByClassName('nav next ui_button primary')[0].classList[4] != 'disabled';
                /*
                console.log(from);
                console.log(when);
                console.log(title);
                console.log(rating);
                console.log(review);
                */                                
            }
            reviewsCounter += nofCurReviews;
        }
    }

    xmlHTTP.open('GET', baseUrl, false);
    xmlHTTP.send();
    
    pagesVisited = 1;
    nextPage = baseUrl.substr(0, baseUrl.indexOf('Reviews')+7) + '-or10-' + baseUrl.substr(baseUrl.indexOf('Reviews')+8);
    console.log(nextPage);

    // instead of counting the reviews, check whether the pagination button 'Next' is disabled or not.
    while (goToNextPage) {
        console.log("==================================================");
        console.log("Will now make a request to the " + (pagesVisited + 1) +"th url");
        console.log("Total reviews gathered so far: " + reviewsCounter);
        oldReviewsCounter = reviewsCounter;
        xmlHTTP.open('GET', nextPage, false);
        xmlHTTP.send();
        if (reviewsCounter == oldReviewsCounter)    {
            console.log("*****************************************************************************");
            console.log("OUPS! THere was an error while trying to get more reviews.Things you can try:");
            console.log("1. Lower the total number of reviews you want to gather.");
            console.log("2. Execute the script again.");
            console.log("3. Nothing!! The script may as well have downloaded all the reviews!!!");
            console.log("   Remember: The reviews we are downloading are only those of the english language!");
            console.log("To verify whether all english reviews were downloaded, you can manually navigate to:");
            console.log(nextPage);
            console.log("and see whether the above page is the last page with english reviews.");
            console.log("*****************************************************************************");
            break;
        }
        nextPage = nextPage.replace('-or' + ((pagesVisited*10).toString())+'-', '-or' + (((pagesVisited+1)*10).toString()) + '-');
        pagesVisited++;
    }
    console.log("==================================================");
    console.log("total reviews gathered: " + reviewsCounter + "/" + totalReviews);
}

// provides functionality to download the data we gathered.
function downloadData() {
    function createDownload(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
    let dataToDownload = '';
    for (let i=0; i<reviews.length; i++) {
        dataToDownload += reviews[i] + "\r\n";
    }
    console.log("==================================================");
    console.log("Will now download a file containing the reviews.");
    // set the filename to the baseUrl. This is not a stable file naming way.
    createDownload(document.title.split('-')[0],dataToDownload);
}


crawler(baseUrl);
downloadData();