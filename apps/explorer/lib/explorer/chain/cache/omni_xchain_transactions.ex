defmodule Explorer.Chain.Cache.OmniXChainTransactions do
  @moduledoc """
  Caches omni xchain tx count.
  """

  alias Explorer.OmniXChain

  require Logger

  use Explorer.Chain.MapCache,
    name: :omni_xchain_transactions,
    key: :count,
    global_ttl: :timer.seconds(5),
    ttl_check_interval: :timer.seconds(1)

  @doc """
  Cached omni xchain tx count.
  """
  @spec count() :: non_neg_integer()
  def count do
    cached_value = __MODULE__.get_count()

    if is_nil(cached_value) do
      0
    else
      cached_value
    end
  end


  defp handle_fallback(:count) do
    case OmniXChain.stats() do
      {:ok, %OmniXChain.Stats{tx_total: tx_total}} ->
        {:update, tx_total}

      {:error, reason} ->
        Logger.error([
          "OMNI: Couldn't fetch omni xchain stats, reason: #{inspect(reason)}"
        ])

        {:return, nil}
    end
  end

  defp handle_fallback(_key), do: {:return, nil}
end
