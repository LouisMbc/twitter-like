// TweetAdapter.kt
package com.example.flow2

import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide

class TweetAdapter(private var tweets: List<Tweet>) :
    RecyclerView.Adapter<TweetAdapter.TweetViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TweetViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_tweet, parent, false)
        return TweetViewHolder(view)
    }

    override fun onBindViewHolder(holder: TweetViewHolder, position: Int) {
        val tweet = tweets[position]
        // Log simplifié car authorProfile n'existe plus sur l'objet Tweet ici
        Log.d("TweetAdapterDebug", "onBindViewHolder - Position: $position, Tweet ID: ${tweet.id}, Content: ${tweet.content}")
        holder.bind(tweet)
    }

    override fun getItemCount(): Int {
        Log.d("TweetAdapterDebug", "getItemCount appelée, retournant: ${tweets.size}")
        return tweets.size
    }

    fun updateData(newTweets: List<Tweet>) {
        Log.d("TweetAdapterDebug", "updateData appelée avec ${newTweets.size} nouveaux tweets.")
        // Log.d("TweetAdapterDebug", "Contenu de newTweets: $newTweets") // Peut être trop verbeux pour Logcat
        tweets = newTweets
        notifyDataSetChanged() // Pour l'instant, DiffUtil sera pour plus tard.
    }

    class TweetViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val authorNameTextView: TextView = itemView.findViewById(R.id.textViewAuthorName)
        private val tweetDateTextView: TextView = itemView.findViewById(R.id.textViewTweetDate)
        private val tweetContentTextView: TextView = itemView.findViewById(R.id.textViewTweetContent)
        private val authorAvatarImageView: ImageView = itemView.findViewById(R.id.imageViewAuthorAvatar)
        private val tweetImageView: ImageView = itemView.findViewById(R.id.imageViewTweetImage)

        fun bind(tweet: Tweet) {
            tweetContentTextView.text = tweet.content ?: "Contenu non disponible"
            tweetDateTextView.text = formatDate(tweet.createdAt)

            // --- GESTION DE L'AUTEUR (PUISQUE authorProfile EST RETIRÉ DE Tweet.kt) ---
            authorNameTextView.text = "Auteur inconnu" // Valeur par défaut
            // authorNameTextView.visibility = View.GONE // Option pour cacher

            authorAvatarImageView.setImageResource(R.drawable.logo_flow) // Placeholder par défaut
            // authorAvatarImageView.visibility = View.GONE // Option pour cacher
            // --- FIN DE LA GESTION DE L'AUTEUR ---

            // --- GESTION DE L'IMAGE DU TWEET ---
            // Utilise la propriété calculée `firstImageUrl` de Tweet.kt
            val imageUrlToLoad = tweet.firstImageUrl

            if (imageUrlToLoad != null) {
                tweetImageView.visibility = View.VISIBLE
                Glide.with(itemView.context)
                    .load(imageUrlToLoad)
                    .placeholder(R.drawable.image_placeholder) // Assurez-vous que ce drawable existe
                    .error(R.drawable.image_error_placeholder)   // Assurez-vous que ce drawable existe
                    .into(tweetImageView)
            } else {
                tweetImageView.visibility = View.GONE
            }
            // --- FIN DE LA GESTION DE L'IMAGE DU TWEET ---
        }

        private fun formatDate(timestamp: String?): String {
            if (timestamp == null) {
                return "Date inconnue"
            }
            // Exemple simple: "2023-10-27T10:30:00Z" -> "2023-10-27"
            // Pour un formatage plus robuste, considérez des bibliothèques de date/heure.
            return try {
                timestamp.substringBefore("T")
            } catch (e: Exception) {
                Log.w("TweetAdapterFormatDate", "Erreur de formatage de la date: $timestamp", e)
                timestamp // Retourne le timestamp brut en cas d'erreur
            }
        }
    }
}