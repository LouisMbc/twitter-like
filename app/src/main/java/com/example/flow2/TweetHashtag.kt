// TweetHashtag.kt
package com.example.flow2

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class TweetHashtag(
    // Si vous décidez de ne pas avoir de colonne 'id' séparée et que la clé primaire
    // est la combinaison de tweet_id et hashtag_id, vous pouvez supprimer ce champ 'id'.
    val id: Int, // int4, clé primaire de la table de jonction

    @SerialName("tweet_id")
    val tweetId: String, // Supposant que Tweets.id est UUID (String)

    @SerialName("hashtag_id")
    val hashtagId: Long, // Supposant que Hashtags.id est INT8 (Long)

    // Optionnel: si vous voulez pouvoir récupérer les détails en une fois
    @SerialName("Tweets") // Nom de la table jointe pour le tweet
    val tweetDetails: Tweet? = null,

    @SerialName("Hashtags") // Nom de la table jointe pour le hashtag
    val hashtagDetails: Hashtag? = null
)