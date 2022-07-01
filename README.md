## How to Run

You are advised to use Opera as your browsing client. That is why, on opera, there is
a built-in VPN service that you may run. You are advised to run it.

1. Go to a Tripadvisor page of a restaurant or a hotel.
	 Make sure the page does not contain a  '.gr/', '.co', '.uk', etc.
	 If it does, just remove that or replace it with '.com'

2. Open Developer Tools.

3. Copy the contents of the appropriate script into either the 'Console' of the 
developer tools, or in the snippets. The last option is the best option.

4. Run it.

5. Happy crawling.


If you want to understand how the restaurant crawler works, look at the code of the 
hotel crawler, the code is similar for both crawlers, but the hotel crawler contains 
sufficient comments to explain it's functionality.


## FAQ

#### Question:
I did everything correctly, but the script is not working. What can I do? 

#### Answer:
- Tripadvisor changes VERY frequently the rendered HTML, introducing however only
small changes. Try to understand the code, maybe run it manually, step by step, to
find out if something is not parsed correctly. As a last resort, you may contact me.



The link to the github repo:  
https://github.com/georzaza/tripadvisor-reviews-crawler