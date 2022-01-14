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

// Before running make sure you have selected the filter 'English' reviews.
// This script is not guaranteed to work on other languages.
// An example page of a restaurant that this script would work on is: 
// https://www.tripadvisor.com/Restaurant_Review-g189507-d4179900-Reviews-Stafylos-Volos_Magnesia_Region_Thessaly.html

// If you want to understand the script better I would advise you to first read the 
// hotel crawler script which has more comments. The logic is pretty much the same.

var baseUrl = document.location.href;
var doc;
var totalReviews = 0;
var reviewsCounter = 0;
var reviews = ['from,when,rating,title,review'];
var reviewsPointer = 0;
var goToNextPage = true;    // indicates whether there are more pages with reviews to crawl.

// clear the browser console messages
clear();

// get the total English Reviews.
totalReviews = parseInt(document.getElementsByClassName('filters-all')[0].getElementsByClassName('count')[0].textContent.substr(1).split(')')[0].replaceAll(',', ''));
console.log("Total Number of English Reviews: " + totalReviews);

function crawler(baseUrl) {
    let xmlHTTP;
    xmlHTTP = new XMLHttpRequest(); 
    xmlHTTP.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200)    {
            doc = document.implementation.createHTMLDocument("doc");
            doc.write(this.responseText);

            curReviews = doc.getElementsByClassName('review-container');
            nofCurReviews = curReviews.length;
            
            // for any reviews that have a 'More' button, click that button.
            // This does not work. If you find a way to make it work, let me know :)
            /*reviewMoreButtons = doc.getElementsByClassName('taLnk ulBlueLinks');
            for (let i=0; i<reviewMoreButtons.length; i++)
                reviewMoreButtons[i].click();
            */
            for (let i=0; i<curReviews.length; i++) {
                from = curReviews[i].getElementsByClassName('info_text pointer_cursor')[0].firstElementChild.textContent;
                rating = (parseInt(curReviews[i].getElementsByClassName('ui_bubble_rating')[0].classList[1].substr(7)))/10;
                when = curReviews[i].getElementsByClassName('ratingDate')[0].title;
                title = curReviews[i].getElementsByClassName('noQuotes')[0].textContent;
                // if the user or the title are in a RTL language like Japanese, this will mess our csv file, 
                // so skip that review.
                if (/[\u0590-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(from) || /[\u0590-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(title))
                    continue;
                review = curReviews[i].getElementsByClassName('partial_entry')[0].textContent;

                // save the review.
                // Something is missing here, and you should yourself implement it cause I was lazy.
                // Since the 'More' button above is not working, some reviews will contain the text:
                // "...More" at their end. Off the top of my head, you can use `review.substr`, 
                // `review.indexOf('...More')` and `review.length` to remove these characters from the review.
                reviews[++reviewsPointer] = from.replaceAll(',',' ') + ',' + when.replaceAll(',',' ') + ',' + rating + ',' + title.replaceAll(',', ' ') + ',' + (review.replaceAll('\n','')).replaceAll(',', ' ');                
                goToNextPage = doc.getElementsByClassName('nav next ui_button primary')[0].classList[4] != 'disabled';                
            }
            reviewsCounter += nofCurReviews;
        }
    }

    xmlHTTP.open('GET', baseUrl, false);
    xmlHTTP.send();
    
    pagesVisited = 1;
    nextPage = baseUrl.substr(0, baseUrl.indexOf('Reviews')+7) + '-or10-' + baseUrl.substr(baseUrl.indexOf('Reviews')+8);    

    // instead of counting the reviews, check whether the pagination button 'Next' is disabled or not.
    while (goToNextPage) {
        console.log("reviews gathered: " + reviewsCounter);
        oldReviewsCounter = reviewsCounter;
        xmlHTTP.open('GET', nextPage, false);
        xmlHTTP.send();
        if (reviewsCounter == oldReviewsCounter)    {
            console.log("*****************************************************************************");
            console.log("OUPS! THere was an error while trying to get more reviews.Things you can try:");
            console.log("1. Lower the total number of reviews you want to gather.");
            console.log("2. Execute the script again.");
            console.log("3. Make sure you have selected the 'English' reviews filter on the page.");
            console.log("4. Nothing!! The script may as well have downloaded all the reviews!!!");
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