# Mapismo Worker for the Past

Mapismo Worker for the Past™ is a Node.js worker focused on fetch data from sources which entries happened in the past.

## How it works

The worker receives an encrypted message from a channel from which is subscribed (a Redis channel). 

To decrypt the message, a secret must be shared between the sender and the worker. The algorithm used to encrypt the date is `aes-256-cbc`. The message contains also the IVB token, which is separated from the message from the delimiter `|||`.

Once decrypted, the message is a Hash with this structure:

````
{
  cartodb_table_name: <string>,   # the name of the table where insert the dat
  cartodb_map_id: <integer>,      # the identifier of the map where the data belongs to
  cartodb_username: <string>,     # the username of the user in CartoDB
  cartodb_userid: <integer>,      # the id of the user in CartoDB
  cartodb_auth_token: <string>,   # OAuth token 
  cartodb_auth_secret: <string>,  # OAuth token secret
  source: <string>,               # the source of the data, i.e.: flickr, instagram
  keyword: <string>,              # the keyword to search for
  latitude: <float>,              # the latitude where search for
  longitude: <float>,             # the longitude where search for
  radius: <integer>,              # the radius in meters
  start_date: <datetime>,         # search from this date
  end_date: <datetime>            # search until this date
}
````

For each new message received, performs the search and inserts the values in the table indicated in the message with the credentials included in the message.

## Setup

In order for this process to run, some environment variables must be set:
  
  - `node_env`: the environment where the app is running
  - `flickr_api_key`: Flickr API key
  - `instagram_client_id`: Instagram client identifier
  - `instagram_client_secret`: Instagram client secret
  - `cartodb_mapismo_consumer_key`: CartoDB consumer key for user Mapismo
  - `cartodb_mapismo_consumer_secret`: CartoDB consumer secret for user Mapismo
  - `secret`: secret password for encrypt and decrypt messages

Depending on the environment `Redis` is setup in a different way:

  - in `production` environment `REDISTOGO_URL` environment variable must be set with the url from Redis to Go
  
  - in `development` environment it assumes that it runs in `localhost`, in port `6379`

## Author

Fernando Blat <ferblape@gmail.com>

Developed for project Mapismo™

## License

MIT license