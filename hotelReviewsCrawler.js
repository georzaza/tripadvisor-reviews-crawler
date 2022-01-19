/**
 * COPYRIGHT 2022
 * 
 * AUTHOR: GIORGOS ZAZANIS
 * 
 * LICENSE: UNIVERSITY OF THESSALY, 
 * DEPARTMENT OF ELECTRICAL & COMPUTER ENGINEERING
 * 
 * YOU ARE NOT AUTHORIZED TO RUN OR USE THIS CODE IN ANY OTHER WAY UNLESS YOU ARE 
 * SOMEHOW RELATED TO THE AFOREMENTIONED DEPARTMENT.(TEACHER, STUDENT, PARTNER, ETC)
 * 
 * 
 * 1. MEMBERS OF THE DEPARTMENT THAT SOMEHOW HAPPENED TO HAVE THIS CODE THIS CODE ARE NOT 
 *    ALLOWED IN ANY WAY TO DISTRIBUTE IT TO ANYONE. 
 * 
 * 2. MEMBERS OF THE DEPARTMENT THAT SOMEHOW HAPPENED TO HAVE THIS CODE THIS CODE ARE ONLY 
 *    ALLOWED TO RUN THIS CODE IF THEY ARE EXPLICITLY REGISTERED TO THE COURSE 
 *    ECE 514 - ΠΕΡΙΒΑΛΛΟΝΤΑ ΕΠΙΛΥΣΗΣ ΠΡΟΒΛΗΜΑΤΩΝ ΓΙΑ ΕΦΑΡΜΟΓΕΣ ΣΤΗΝ ΕΠΙΣΤΗΜΗ ΔΕΔΟΜΕΝΩΝ.
 * 
 * 3. MEMBERS OF THE DEPARTMENT THAT SOMEHOW APPENED TO HAVE THIS CODE ARE ALLOWED
 *    TO MODIFY THIS CODE. FOR ANY CODE THAT HAS BEEN THE PRODUCT OF THIS CODE SECTIONS 
 *    1,2, AND 3 APPLY.
 * 
 * 4. SPECIFICALLY FOR THE TEACHER OF THE COURSE MENTIONED IN SECTION 2, ALL PERMISSIONS
 *    ARE GRANTED, INCLUDING MODIFICATION, DISTRIBUTION, RUNNING, ETC,  EXCEPT FOR THE 
 *    DISTRIBUTION OF THIS CODE OR ANY CODE THAT HAS BEEN THE PRODUCT OF THIS CODE TO 
 *    ANY THIRD PARTY THAT IS NOT AT LEAST SOMEHOW RELATED TO THE UNIVERSITY OF THESSALY
 *    (TEACHER, STUDENT, PARTNER, ETC). DISTRIBUTION TO THE piazza PLATFORM IS ALSO GRANTED.
 * 
 * 5. IN CASE OF THE COURSE CHANGING NAME OR TEACHER IN THE FUTURE, ALL 4 SECTIONS STILL APPLY.
 */


// The script is a little messy, but it gets it's job done.
// If you find some problem and don't know how to fix it, let me know, to see what I can do about it.
// If you do know how to fix it and actually fix it, I would appreciate it if you let me know.

// An example page of a hotel that this script would work on is: 
// https://www.tripadvisor.com/Hotel_Review-g189507-d262261-Reviews-Domotel_Xenia_Volos_City_Resort-Volos_Magnesia_Region_Thessaly.html

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

// clear the browser console messages
clear();

// The crawler. 
// We do a xmlHTTPRequest at the baseUrl at first (although not needed), get the reviews of the baseUrl and save them.
// Then we create the next url, do a xmlHTTP request to it, get the reviews again, etc,
function crawler(baseUrl) {
    
    let temp = document.querySelector("[data-test-target='reviews-tab']");
    //totalReviews = parseInt(temp.getElementsByClassName('cvxmR')[2].textContent.substr(1).split(')')[0]);
    langFilter = document.querySelectorAll("[for='LanguageFilter_1']");
    let totalReviews = 0;
    for (let j=0; j<langFilter[0].childElementCount; j++) {
        if (langFilter[0].childNodes[j].textContent == 'English')
            totalReviews = langFilter[0].childNodes[j].nextElementSibling.textContent.substr(1).split(')')[0];
    }
    let xmlHTTP;
    xmlHTTP = new XMLHttpRequest(); 

    xmlHTTP.onreadystatechange = function() {
        
        if (this.readyState == 4 && this.status == 200)    {
            
            // get the response and create a temporary 'document' variable in order to use DOM operations on it.
            doc = document.implementation.createHTMLDocument("doc");
            doc.write(this.responseText);

            curReviews = doc.querySelector("[data-test-target='reviews-tab']");
            nofCurReviews = curReviews.childNodes.length-3;
            
            for (let i=2; i<=nofCurReviews+1; i++) {
                curReview = curReviews.childNodes[i];
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

                // if the user or the title are in a RTL language like Japanese, this will mess our csv file, 
                // so skip that review.
                if (/[\u0590-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(from) || /[\u0590-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(title))
                    continue;

                // If any of the fields we are interested in contains one or more commas
                // replace them with a space, since we want to export to a csv file.
                reviews[++reviewsPointer] = from.replaceAll(',', ' ') + ',' + when.replaceAll(',', ' ') + ',' + rating + ',' + title.replaceAll(',', ' ') + ',' + review.replaceAll(',', ' ');
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
    // The third page of the reviews will be like some-part-of-baseurl + -or10  + the-rest-of-the-baseUrl, etc.
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