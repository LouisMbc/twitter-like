// HashtagSubscription.kt
package com.example.flow2

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class HashtagSubscription(
    val id: Long, // int8 correspond à Long

    @SerialName("user_id")
    val userId: String, // UUID de Profile.id

    @SerialName("hashtag_id")
    val hashtagId: Long, // int8 de Hashtags.id

    @SerialName("created_at")
    val createdAt: String, // Timestamp

    // --- Champs supplémentaires pour les données jointes (optionnel) ---
    @SerialName("Profile") // Pour les détails de l'utilisateur abonné
    val userProfile: Profile? = null,

    @SerialName("Hashtags") // Pour les détails du hashtag abonné
    // Le nom ici doit correspondre à votre table de hashtags
    val hashtagDetails: Hashtag? = null // Supposant que vous avez une data class Hashtag.kt
)