---
title: 'api.floofy.dev ("hana")'
description: 'Starting page of docs.noelware.org/api'
author: 'Noel (@auguwu)'
---

# 花 / Hana · [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/auguwu/hana/LICENSE)
> **花 ("hana"; flower)** is a API service mainly for proxying from one API to another API.

## Reference
Hana is only based on one layer, which is REST / HTTPS.

#### Base URLs

```
Base URL: https://api.floofy.dev
CDN URL:  https://cdn.floofy.dev
```

###### API Versions
|Version|Status|Default|
|-------|------|-------|
|v2|Available|✓|
|v1|Removed|❌|

You can run different API versions using the `/v` prefix (example: `/v2/`).

## Changelog
Coming soon.

## Endpoints
### %{method: GET; path: /}
> Returns the main endpoint of Hana.

#### JSON Response Body
```json
{
  "hello": "world"
}
```

### %{method: GET; path: /yiff}
> Returns a JSON response of... you guessed it... yiff.

#### JSON Response Body
```json
{
  "height": Number,
  "width": Number,
  "url": String
}
```

|Name|Type|Description|
|----|----|-----------|
|`height`|`Number`|Returns the height of the image, it'll return `0` if it couldn't calculate it|
|`width`|`Number`|Returns the width of the image, it'll return `0` if it couldn't calculate it|
|`url`|`String`|Returns the CDN URL of the image|

### %{method: GET; path: /yiff/random}
> Returns the image buffer of the image that was randomly selected.

### %{method: GET; path: /kadi}
> Returns a JSON response of [Noel](https://floofy.dev)'s red panda plush: Kadi.

#### JSON Response Body
```json
{
  "height": Number,
  "width": Number,
  "url": String
}
```

|Name|Type|Description|
|----|----|-----------|
|`height`|`Number`|Returns the height of the image, it'll return `0` if it couldn't calculate it|
|`width`|`Number`|Returns the width of the image, it'll return `0` if it couldn't calculate it|

### %{method: GET; path: /kadi}
> Returns the image buffer of the image that was randomly selected.

### %{method: GET; path: /sponsors/:login}
> Returns a list of the sponsors of the GitHub user and the list of sponsors the user is sponsoring.

### Path Parameters
|Name|Type|Description|Required|
|`login`|String|GitHub user to check sponsorships|true|
|`private`|Boolean|If the payload should include private sponsorships|false|
|`pricing`|`cents` or `dollars`|The pricing by dollars or cents|false|

#### JSON Response Body
```json
{
  "sponsoring": GitHubSponsorData,
  "sponsors": GitHubSponsorData
}
```

|Name|Type|Description|
|----|----|-----------|
|`sponsoring`|[GitHubSponsorData](/hana#type-githubsponsordata)|Object of the total sponsoring count and the users they are sponsoring.|
|`sponsors`|[GitHubSponsorData](/hana#type-githubsponsordata)|Object of the total sponsor count the users who are sponsoring the user.|

## type `GitHubSponsorData`
|Name|Type|Description|
|----|----|-----------|
|`total_count`|Number|Returns the total count|
|`data`|[Array<GitHubSponsorUserData>](/hana#type-githubsponsoruserdata)|Returns an Array of objects that represent the sponsorship details.|

> TypeScript

```ts
interface GitHubSponsorData {
  total_count: number;
  data: GitHubSponsorUserData[];
}
```

> Kotlin
```kt
data class GitHubSponsorData(
  val total_count: Int,
  val data: List<GitHubSponsorUserData>
)
```

## type `GitHubSponsorUserData`
> Anything that ends with `?` (example: `type?`) is gonna be `null`.

|Name|Type|Description|
|----|----|-----------|
|`tier_selected_at`|String|ISO8601-formatted date of when the tier was selected|
|`twitter_handle`|String?|The user's twitter handle, if specified.|
|`website_url`|String?|The user's website, if specified.|
|`avatar_url`|String|The user's avatar, if specified.|
|`followers`|Number|How many followers the user has|
|`following`|Number|How many people the user is following|
|`joined_at`|String|ISO8601-formatted date on when the sponsorship was created.|
|`company`|String?|The user's companies, if specified.|
|`status`|[GitHubUserStatusData?](#type-githubuserstatusdata)|The status information of that user, if specified.|
|`login`|String|The user's username|
|`name`|String?|The user's name, if specified.|
|`tier`|[GitHubSponsorTierData](#type-githubsponsortierdata)|The tier information the user selected|
|`bio`|String?|The user's biography displayed on their profile, if specified.|

> TypeScript

```ts
interface GitHubSponsorUserData {
  tier_selected_at: string | null;
  twitter_handle: string | null;
  website_url: string | null;
  avatar_url: string;
  followers: number;
  following: number;
  joined_at: string;
  company: string | null;
  status: GitHubUserStatusData | null;
  login: string;
  name: string | null;
  tier: GitHubSponsorTierData;
  bio: string | null;
}
```

> Kotlin
```kt
data class GitHubSponsorUserData(
  val tier_selected_at: String?,
  val twitter_handle: String?,
  val website_url: String?,
  val avatar_url: String,
  val followers: Int,
  val following: Int,
  val joined_at: String,
  val company: String?,
  val status: GitHubUserStatusData?,
  val login: String,
  val name: String?,
  val tier: GitHubSponsorTierData,
  val bio: String?
)
```

## type `GitHubUserStatusData`
> Anything that ends with `?` (example: `type?`) is gonna be `null`.

|Name|Type|Description|
|----|----|-----------|
|`expires_at`|String?|ISO8601-formatted date of when the status expires at|
|`message`|String|The message of the status, if any|
|`emoji`|String|The emoji specifying the status, if any.|

> TypeScript

```ts
interface GitHubUserStatusData {
  expires_at: string | null;
  message: string;
  emoji: string;
}
```

> Kotlin

```kt
data class GitHubUserStatusData(
  val expires_at: String?,
  val message: String,
  val emoji: String
)
```

## type `GitHubSponsorTierData`
> Anything that ends with `?` (example: `type?`) is gonna be `null`.

|Name|Type|Description|
|----|----|-----------|
|`custom_amount`|Boolean|If the tier was a custom amount paid.|
|`one_time`|Boolean|If the tier was purchased once, not monthly.|
|`created_at`|String|ISO8601-formatted date on when the tier was created at|
|`monthly_price`|Number|Returns the monthly price of this tier, this will defer from the `?pricing` query.|
|`name`|String|The name of the tier|

##### TypeScript

```ts
interface GitHubSponsorTierData {
  custom_amount: boolean;
  monthly_price: number;
  created_at: string;
  one_time: boolean;
  name: string;
}
```

##### Kotlin

```kt
data class GitHubSponsorTierData(
  val custom_amount: Boolean,
  val monthly_price: Int,
  val created_at: String,
  val one_time: Boolean,
  val name: String
)
```
