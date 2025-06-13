// Comment.kt - Reste structurellement la même
package com.example.flow2

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Comment(
    val id: String,
    val content: String,
    @SerialName("created_at")
    val createdAt: String,
    @SerialName("tweet_id")
    val tweetId: String,
    @SerialName("parent_comment_id")
    val parentCommentId: String? = null,
    @SerialName("author_id") // Cette valeur sera Profile.user_id (auth.uid())
    val authorId: String,
    @SerialName("view_count")
    val viewCount: Long? = 0,

    @SerialName("Profile") // Le nom de la clé pour les données du profil joint
    val authorProfile: Profile? = null
)