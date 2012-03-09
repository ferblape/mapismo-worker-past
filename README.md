# Mapismo Worker for the Past

Mapismo Worker for the Past™ is a Node.js worker focused on fetch data from sources which entries happened in the past.

## How it works

The worker recives a message from a channel from which is subscribed (a Redis channel). The message is a Hash with this structure:

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

On each new message, performs the search and inserts the values in the table indicated in the message with the credentials in the message.

## Setup

In order for this process to run, some environment variables must be set:
  
  - `node_env`: the environment where the app is running

Depending on the environment `Redis` is setup in a different way:

  - in `production` environment `redistogo_url` environment variable must be set with the url from Redis to Go
  
  - in `development` environment it assumes that it runs in `localhost`, in port `6379`

## Author

Fernando Blat <ferblape@gmail.com>

Developed for project Mapismo™

## License

MIT license