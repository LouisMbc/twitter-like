// ProfileAdapter.kt
package com.example.flow2

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class ProfileAdapter(private var profiles: List<Profile>) :
    RecyclerView.Adapter<ProfileAdapter.ProfileViewHolder>() {

    // ViewHolder qui contient les vues pour chaque item
    class ProfileViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val nameTextView: TextView = itemView.findViewById(R.id.textViewProfileName)
        val nicknameTextView: TextView = itemView.findViewById(R.id.textViewProfileNickname)
        // Ajoutez d'autres vues ici si nécessaire (bioTextView, etc.)
    }

    // Crée de nouvelles vues (invoqué par le layout manager)
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProfileViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_profile, parent, false) // Utilise votre item_profile.xml
        return ProfileViewHolder(view)
    }

    // Remplace le contenu d'une vue (invoqué par le layout manager)
    override fun onBindViewHolder(holder: ProfileViewHolder, position: Int) {
        val profile = profiles[position]
        holder.nameTextView.text = "${profile.firstName ?: ""} ${profile.lastName ?: ""}".trim()
        holder.nicknameTextView.text = profile.nickname ?: "N/A"
        // Mettez à jour d'autres vues ici
    }

    // Retourne la taille de votre dataset (invoqué par le layout manager)
    override fun getItemCount() = profiles.size

    // Fonction pour mettre à jour la liste des profils et notifier l'adapter
    fun updateData(newProfiles: List<Profile>) {
        profiles = newProfiles
        notifyDataSetChanged() // Moins efficace, pour des listes plus grandes, utilisez DiffUtil
    }
}