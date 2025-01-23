# INVENTORY GATEWAY APP
- This is a web applcation that does the following tasks:
1. Authenticates the user
2. Fetches items from veeqo inventory
3. Fetches items from squarespace ecommerce
4. Filter items fetched from veeqo using the once fetched from squarespace
5. Use the filtered items from veeqo to update squarespace items quantity
6. Use node-cron jobs to automate the process of updating the squarespace items daily
7. Stores the updated items, errors, squarespace items and veeqo items in a MySql database 

# WHAT I LEARNED IN THIS PROJECT
- How to use API keys to authorise fetching items from veeqo
- How to use API keys to authorise fetching items from squarespace
- How to update squarespace items using items fetched from veeqo
- How to use cron job to schedule tasks to happen automatically
- How to use express sessions and storing the cookies in your prefered database
- 