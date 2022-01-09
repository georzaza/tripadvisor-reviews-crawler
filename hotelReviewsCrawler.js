// the url of a hotel to download data from. 
var baseUrl = document.location.href;

// variable to turn the responseText into a temporary document variable, enabling us
// to manipulate the DOM structure of it.
var doc;

// the number of the totalReviews of the hotel in tripadvisor.
var totalReviews = 0;

// counts the reviews gathered so far.
var reviewsCounter = 0;

// will hold the review data
var reviews = ['from,when,rating,title,review'];

// pointer to the array above.
var reviewsPointer = 0;

// The crawler. 
// We do a xmlHTTPRequest at the baseUrl at first (although not needed), get the reviews of the baseUrl and save them.
// Then we create the next url, do a xmlHTTP request to it, get the reviews again, etc,
// until either the reviews we gathered are ~200 or we reached the final review if the totalReviews < 200.
function crawler(baseUrl) {

    let xmlHTTP;
    xmlHTTP = new XMLHttpRequest(); 

    // represents whether we make a request to the baseUrl or not. 
    var flag=true;
    xmlHTTP.onreadystatechange = function() {
        
        if (this.readyState == 4 && this.status == 200)    {
            
            // get the response and create a temporary 'document' variable in order to use DOM operations on it.
            doc = document.implementation.createHTMLDocument("doc");
            doc.write(this.responseText);

            // Since all pages that we will visit contain the totalReviews value, we only want
            // to get this value once.
            if (flag) {
                totalReviews = parseInt((doc.querySelectorAll('.cdKMr.Mc._R.b'))[0].textContent);
                flag = false;
            }

            curReviews = doc.querySelector("[data-test-target='reviews-tab']");
            nofCurReviews = curReviews.firstElementChild.childNodes.length-3;
            
            for (let i=2; i<=nofCurReviews+1; i++) {
                curReview = curReviews.firstElementChild.childNodes[i];
                from = (curReview.childNodes[0].childNodes[1].childNodes[1].childNodes[0].childNodes[0]).textContent;
                when = curReview.childNodes[0].childNodes[1].childNodes[1].childNodes[0].childNodes[1].textContent.substring(16);

                // If the review contains an image between the author-data and the rest
                if (curReview.childElementCount == 3) {
                    rating = curReview.childNodes[2].childNodes[0].childNodes[0].childNodes[0].className.substr(-2);
                    rating = rating/10;
                    title = curReview.childNodes[2].childNodes[1].textContent;
                    // expand review content in order to get the full review. (click the 'Read more' button)
                    curReview.childNodes[2].childNodes[2].childNodes[0].childNodes[1].click();
                    review = curReview.childNodes[2].childNodes[2].childNodes[0].childNodes[0].childNodes[0].textContent;
                }
                else {
                    rating = curReview.childNodes[1].childNodes[0].childNodes[0].childNodes[0].className.substr(-2);
                    rating = rating/10;
                    title = curReview.childNodes[1].childNodes[1].textContent;
                    // expand review content in order to get the full review. (click the 'Read more' button)
                    curReview.childNodes[1].childNodes[2].childNodes[0].childNodes[1].click();
                    review = curReview.childNodes[1].childNodes[2].childNodes[0].childNodes[0].childNodes[0].textContent;
                }

                // If the 'review' variable contains commas ',' replace them with a space, since we want to export to a csv file.
                // Also do the same for the 'title' variable.
                reviews[++reviewsPointer] = from + ',' + when + ',' + rating + ',' + title.replaceAll(',', ' ') + ',' + review.replaceAll(',', ' ');
            }
            reviewsCounter += nofCurReviews;
        }
    }

    // make the first request to the baseUrl. The third argument, when set to 'false'
    // will result in a synchronous request. This is intended. 
    // Changing this argument will most probably require a whole new logic 
    // on how to get the review data from each url. (aka a completely new script)
    xmlHTTP.open('GET', baseUrl, false);
    xmlHTTP.send();
    
    // Tripadvisor has a specific format for each of the reviews pages.
    // The second page of the reviews will be like some-part-of-baseurl + -or5-  + the-rest-of-the-baseUrl.
    // The  third page of the reviews will be like some-part-of-baseurl + -or10  + the-rest-of-the-baseUrl, etc.
    // That explains the use of this variable.
    pagesVisited = 1;

    // build the second url.
    nextPage = baseUrl.substr(0, baseUrl.indexOf('Reviews')+7) + '-or5-' + baseUrl.substr(baseUrl.indexOf('Reviews')+8);
    
    
    while (reviewsCounter < totalReviews) {
        // just some msgs so that we know that the script is still running.
        console.log("==================================================");
        console.log("Will now make a request to the " + (pagesVisited + 1) +"th url");
        console.log("Total reviews gathered so far: " + reviewsCounter);
        console.log("Stopping the script will result in losing all reviews gathered.");
        
        oldReviewsCounter = reviewsCounter;
        xmlHTTP.open('GET', nextPage, false);
        xmlHTTP.send();

        // stop if we did not crawl any new reviews (for ANY reason, perhaps including a network failure)
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
        nextPage = nextPage.replace('-or' + ((pagesVisited*5).toString())+'-', '-or' + (((pagesVisited+1)*5).toString()) + '-');
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