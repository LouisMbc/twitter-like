package com.example.flow2

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlin.coroutines.cancellation.CancellationException

class AccueilFragment : Fragment() {

    private lateinit var recyclerViewTweets: RecyclerView
    private lateinit var tweetAdapter: TweetAdapter
    private val supabase = MyApplication.supabaseClient

    // Optionnel : Si vous passez à ViewBinding
    // private var _binding: FragmentAccueilBinding? = null
    // private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Si ViewBinding:
        // _binding = FragmentAccueilBinding.inflate(inflater, container, false)
        // return binding.root
        return inflater.inflate(R.layout.fragment_accueil, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Si ViewBinding:
        // recyclerViewTweets = binding.recyclerViewTweetsInFragment
        // Sans ViewBinding:
        try {
            recyclerViewTweets = view.findViewById(R.id.recyclerViewTweetsInFragment)
        } catch (e: NullPointerException) {
            Log.e("AccueilFragment", "RecyclerView avec ID 'recyclerViewTweetsInFragment' non trouvé dans R.layout.fragment_accueil", e)
            Toast.makeText(requireContext(), "Erreur de layout du fragment", Toast.LENGTH_LONG).show()
            return // Ne pas continuer si le RecyclerView n'est pas trouvé
        }

        tweetAdapter = TweetAdapter(emptyList()) // Assurez-vous que TweetAdapter est correct
        recyclerViewTweets.layoutManager = LinearLayoutManager(requireContext())
        recyclerViewTweets.adapter = tweetAdapter

        fetchAllTweets()
    }


    // Dans AccueilFragment.kt
    private fun fetchAllTweets() {
        lifecycleScope.launch { // Se lance sur Main (généralement)
            Log.d("AccueilFragmentTweets", "fetchAllTweets: Coroutine lancée.")
            if (MyApplication.supabaseClient == null) {
                Log.e("AccueilFragmentTweets", "ERREUR CRITIQUE: supabaseClient est null!")
                return@launch
            }
            Log.d("AccueilFragmentTweets", "fetchAllTweets: supabaseClient n'est pas null.")

            try {
                Log.d("AccueilFragmentTweets", "Passage à Dispatchers.IO pour l'appel Supabase...")
                val tweetsList: List<Tweet> = withContext(Dispatchers.IO) { // CHANGEMENT ICI

                    Log.d("AccueilFragmentTweets", "Dans Dispatchers.IO: Tentative de récupération (TRÈS SIMPLE)...")
                    supabase.from("Tweets")
                        .select()
                        .decodeList<Tweet>()
                }
                Log.d("AccueilFragmentTweets", "Retour de Dispatchers.IO.")


                if (tweetsList.isNotEmpty()) {
                    Log.d("AccueilFragmentTweets", "${tweetsList.size} tweets récupérés (contenu seul).")
                    tweetAdapter.updateData(tweetsList)
                } else {
                    Log.d("AccueilFragmentTweets", "Aucun tweet trouvé (contenu seul).")
                    Toast.makeText(requireContext(), "Aucun tweet à afficher", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Log.e("AccueilFragmentTweets", "Erreur lors de la récupération des tweets (Dispatchers.IO): ${e.message}", e)
                Toast.makeText(requireContext(), "Erreur Supabase (IO): ${e.localizedMessage}", Toast.LENGTH_LONG).show()
            } catch (ce: CancellationException) {
                Log.w("AccueilFragmentTweets", "Coroutine annulée pendant la récupération des tweets.", ce)
                throw ce
            }
            finally {
                Log.d("AccueilFragmentTweets", "fetchAllTweets: Coroutine terminée (bloc finally).")
            }
        }
    }
}