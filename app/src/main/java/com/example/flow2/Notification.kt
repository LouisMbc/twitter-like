// Notification.kt
package com.example.flow2

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Notification(
    val id: String, // UUID

    @SerialName("user_id")
    val userId: String, // UUID de Profile.id (destinataire de la notification)

    @SerialName("sender_id")
    val senderId: String? = null, // UUID de Profile.id (initiateur de l'action, nullable)

    @SerialName("content_id")
    val contentId: String? = null, // UUID du contenu associé

    @SerialName("content_type")
    val contentType: String? = null, // ex: "tweet", "comment", "profile"

    val type: String, // ex: "like", "comment", "new_follower"

    val message: String? = null, // Message de la notification

    @SerialName("is_read")
    var isRead: Boolean = false,

    @SerialName("created_at")
    val createdAt: String, // Idéalement un type de date/heure plus spécifique si vous le traitez

    // --- Champs supplémentaires pour les données jointes (optionnel mais très utile) ---
    @SerialName("SenderProfile") // Pour les détails de l'expéditeur de la notification (qui a agi)
    val senderProfileDetails: Profile? = null


)