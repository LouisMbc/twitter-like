// Message.kt
package com.example.flow2

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Message(
    val id: String, // UUID

    @SerialName("sender_id")
    val senderId: String, // UUID de Profile.id

    @SerialName("recipient_id")
    val recipientId: String, // UUID de Profile.id

    val content: String,

    @SerialName("created_at")
    val createdAt: String, // Timestamp

    @SerialName("is_read")
    var isRead: Boolean = false, // Mutable si vous voulez pouvoir le mettre à jour côté client
    // avant de le synchroniser avec le serveur.

    // --- Champs supplémentaires pour les données jointes (optionnel) ---
    @SerialName("SenderProfile") // Nom arbitraire pour la relation, à définir dans le select
    val senderProfile: Profile? = null,

    @SerialName("RecipientProfile") // Nom arbitraire pour la relation, à définir dans le select
    val recipientProfile: Profile? = null
)