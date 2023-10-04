defmodule Explorer.OmniXChain do
  @moduledoc """
  Wrapper around omni xchain indexer api.
  """

  defmodule Stats do
    @moduledoc """
    Omni xchain statistics.

    ## Fields

    - `tx_total` (integer()): The total number of xchain transactions.
    """

    defstruct tx_total: nil
  end

  def base_url() do
    System.get_env("OMNI_XCHAIN_API_URL", "http://localhost:4000")
  end

  def endpoint(path) do
    base_url() <> path
  end


  @doc """
  Get omni xchain statistics.
  """
  @spec stats() :: {:ok, Stats.t()} | {:error, term()}
  def stats do
    case get_stats() do
      {:ok, json} ->
        case parse_stats(json) do
          {:ok, stats} ->
            {:ok, stats}
          {:error, reason} ->
            {:error, reason}
        end

      {:error, reason} ->
        {:error, reason}
    end
  end


  defp get_stats() do
    get(endpoint("/stats"))
  end

  defp parse_stats(json) do
    case Jason.decode(json) do
      {:ok, %{"tx_total" => tx_total}} ->
        {:ok, %Stats{tx_total: tx_total}}
      {:ok, _} ->
        {:error, "JSON does not match expected format: Stats{tx_total}"}
      {:error, reason} ->
        {:error, reason}
    end
  end

  def get(url) do
    case HTTPoison.get(url) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        {:ok, body}
      {:ok, %HTTPoison.Response{status_code: status_code}} ->
        {:error, "HTTP request failed with status #{status_code}"}
      {:error, reason} ->
        {:error, reason}
    end
  end

end
