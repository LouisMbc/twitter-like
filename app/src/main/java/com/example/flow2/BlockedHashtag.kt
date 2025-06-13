// BlockedHashtag.kt
package com.example.flow2

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class BlockedHashtag(
    val id: Long, // int8 correspond à Long

    @SerialName("user_id")
    val userId: String, // UUID de Profile.id

    @SerialName("hashtag_id")
    val hashtagId: Long, // int8 de Hashtags.id

    @SerialName("created_at")
    val createdAt: String, // Timestamp, généralement non-null

    // --- Champs supplémentaires pour les données jointes (optionnel) ---
    // Si vous voulez récupérer les détails du profil ou du hashtag en même temps

    @SerialName("Profile") // Doit correspondre à ce que Supabase retourne pour la jointure
    val userProfile: Profile? = null,

    @SerialName("Hashtags") // Doit correspondre à ce que Supabase retourne pour la jointure
    // ou le nom de votre table de hashtags si différent
    val hashtagDetails: Hashtag? = null // Supposant que vous avez une data class Hashtag
)