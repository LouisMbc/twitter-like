// Reaction.kt
package com.example.flow2

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Reaction(
    val id: Long, // int8

    @SerialName("user_id")
    val userId: String, // UUID de Profile.id

    @SerialName("tweet_id")
    val tweetId: String? = null, // UUID de Tweets.id, nullable

    @SerialName("comment_id")
    val commentId: String? = null, // UUID de Comments.id, nullable

    @SerialName("reaction_type")
    val reactionType: String, // ex: "like", "love"

    @SerialName("created_at")
    val createdAt: String, // Timestamp

    // --- Champs supplémentaires pour les données jointes (optionnel) ---
    @SerialName("UserProfile") // Pour les détails de l'utilisateur qui a réagi
    val userProfile: Profile? = null

)