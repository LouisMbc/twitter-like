// ViewRecord.kt
package com.example.flow2

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement // Pour jsonb flexible

@Serializable
data class ViewRecord(
    val id: String, // UUID

    @SerialName("tweet_id")
    val tweetId: String? = null, // UUID de Tweets.id, nullable

    @SerialName("comment_id")
    val commentId: String? = null, // UUID de Comments.id, nullable

    @SerialName("views_count")
    val viewsCount: Int,

    // Pour `viewers`, vous pouvez utiliser List<String> si vous stockez un simple tableau d'UUID.
    // JsonElement est plus flexible si la structure du JSON peut varier ou est plus complexe.
    // Si c'est toujours une liste d'UUIDs:
    val viewers: List<String>? = null, // Liste des Profile.id des viewers

    @SerialName("created_at")
    val createdAt: String, // Timestamp

    @SerialName("updated_at")
    val updatedAt: String, // Timestamp

    // Optionnel: pour joindre le tweet ou commentaire concerné
    @SerialName("Tweets")
    val tweetDetails: Tweet? = null,

    @SerialName("Comments")
    val commentDetails: Comment? = null // Supposant que vous avez une data class Comment
)