import Config

config :ethereum_jsonrpc, EthereumJSONRPC.Tracer, env: "production", disabled?: true

config :logger, :ethereum_jsonrpc,
  level: :info,
  path: Path.absname("logs/prod/ethereum_jsonrpc.log"),
  rotate: %{max_bytes: 1_048_576, keep: 1}
