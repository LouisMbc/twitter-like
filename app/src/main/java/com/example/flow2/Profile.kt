package com.example.flow2 // Assurez-vous que le package est correct

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Serializable
data class Profile(
    val id: String, // Clé primaire de la table Profile (UUID)

    @SerialName("updated_at")
    val updatedAt: String? = null, // Timestamp

    val bio: String? = null,
    val certified: Boolean? = false,

    @SerialName("profilePicture")
    val profilePicture: String? = null,

    @SerialName("lastName")
    val lastName: String? = null,

    @SerialName("firstName")
    val firstName: String? = null,

    @SerialName("user_id")
    val userId: String, // Clé étrangère vers auth.users.id (UUID)

    val nickname: String? = null,

    @SerialName("follower_count")
    val followerCount: Int? = 0,

    @SerialName("following_count")
    val followingCount: Int? = 0,

    @SerialName("is_premium")
    val isPremium: Boolean? = false,

    @SerialName("premium_features")
    val premiumFeatures: JsonElement? = null
)